import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateNfcSchema = z.object({
  label: z.string().min(2).max(100).optional(),
  model: z.string().min(2).max(50).optional(),
  batch: z.string().max(50).optional().nullable(),
  status: z.enum(["UNASSIGNED", "ASSIGNED", "INACTIVE"]).optional(),
  qrCodeId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const card = await prisma.nfcCard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Tarjeta NFC no encontrada" }, { status: 404 });
    }

    if (session.role === "CLIENT" && card.userId !== session.id) {
      return NextResponse.json({ error: "No tiene permisos para modificar esta tarjeta" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateNfcSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: any = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.batch !== undefined) updateData.batch = data.batch;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.qrCodeId !== undefined) {
      if (data.qrCodeId === null || data.qrCodeId === "") {
        updateData.qrCodeId = null;
        updateData.status = "UNASSIGNED";
      } else {
        const qr = await prisma.qRCode.findUnique({ where: { id: data.qrCodeId } });
        if (!qr) {
          return NextResponse.json({ error: "El código QR a asociar no existe" }, { status: 404 });
        }
        if (session.role === "CLIENT" && qr.userId !== session.id) {
          return NextResponse.json({ error: "No tiene permisos sobre este código QR" }, { status: 403 });
        }
        updateData.qrCodeId = data.qrCodeId;
        updateData.status = "ASSIGNED";
      }
    }

    if (data.status !== undefined && data.qrCodeId === undefined) {
      updateData.status = data.status;
    }

    const updated = await prisma.nfcCard.update({
      where: { id: params.id },
      data: updateData,
      include: {
        qrCode: true,
      },
    });

    return NextResponse.json({ success: true, card: updated });
  } catch (error) {
    console.error("Error al actualizar tarjeta NFC:", error);
    return NextResponse.json({ error: "Error al actualizar la tarjeta NFC" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const card = await prisma.nfcCard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Tarjeta NFC no encontrada" }, { status: 404 });
    }

    if (session.role === "CLIENT" && card.userId !== session.id) {
      return NextResponse.json({ error: "No tiene permisos para eliminar esta tarjeta" }, { status: 403 });
    }

    await prisma.nfcCard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Tarjeta NFC desvinculada y eliminada" });
  } catch (error) {
    console.error("Error al eliminar tarjeta NFC:", error);
    return NextResponse.json({ error: "Error al eliminar tarjeta NFC" }, { status: 500 });
  }
}

