import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createNfcSchema = z.object({
  uid: z.string().min(4, "El UID físico de la tarjeta es requerido").max(50),
  label: z.string().min(2, "La etiqueta o nombre es requerida").max(100),
  model: z.string().min(2).max(50).default("NTAG215"),
  batch: z.string().max(50).optional().nullable(),
  qrCodeId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  targetUserId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = {};
    if (session.role === "CLIENT") {
      where.userId = session.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { uid: { contains: search, mode: "insensitive" } },
        { label: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const cards = await prisma.nfcCard.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        qrCode: {
          select: {
            id: true,
            title: true,
            shortCode: true,
            destinationUrl: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error al listar tarjetas NFC:", error);
    return NextResponse.json({ error: "Error al listar tarjetas NFC" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = createNfcSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const normalizedUid = data.uid.trim().toUpperCase();

    // Validar si el UID ya está registrado
    const existing = await prisma.nfcCard.findUnique({
      where: { uid: normalizedUid },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe una tarjeta NFC registrada con el UID ${normalizedUid}` },
        { status: 400 }
      );
    }

    let assignedUserId = session.id;
    if (session.role === "ADMIN" && data.targetUserId) {
      assignedUserId = data.targetUserId;
    }

    // Si viene con un qrCodeId, verificar que exista y pertenezca al usuario
    let status = "UNASSIGNED";
    if (data.qrCodeId) {
      const qr = await prisma.qRCode.findUnique({
        where: { id: data.qrCodeId },
      });
      if (!qr) {
        return NextResponse.json({ error: "El código QR seleccionado no existe" }, { status: 404 });
      }
      if (session.role === "CLIENT" && qr.userId !== session.id) {
        return NextResponse.json({ error: "No tiene permisos sobre el código QR seleccionado" }, { status: 403 });
      }
      status = "ASSIGNED";
    }

    const card = await prisma.nfcCard.create({
      data: {
        uid: normalizedUid,
        label: data.label,
        model: data.model || "NTAG215",
        batch: data.batch || null,
        qrCodeId: data.qrCodeId || null,
        status: status as any,
        notes: data.notes || null,
        userId: assignedUserId,
      },
      include: {
        qrCode: true,
      },
    });

    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar tarjeta NFC:", error);
    return NextResponse.json({ error: "Error al registrar la tarjeta NFC" }, { status: 500 });
  }
}

