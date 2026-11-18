import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cardPayloadSchema } from "@/lib/card-design";

export const dynamic = "force-dynamic";

const MAX_CARDS_PER_CLIENT = 100;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cards = await prisma.cardDesign.findMany({
      where: session.role === "CLIENT" ? { userId: session.id } : {},
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        config: true,
        updatedAt: true,
        qrCode: { select: { id: true, title: true, shortCode: true } },
        user: { select: { id: true, name: true, company: true } },
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error al listar diseños de tarjeta:", error);
    return NextResponse.json({ error: "Error al listar los diseños" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const parsed = cardPayloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    const { name, config } = parsed.data;

    if (config.qrCodeId) {
      const qr = await prisma.qRCode.findUnique({ where: { id: config.qrCodeId } });
      if (!qr) {
        return NextResponse.json({ error: "El código QR seleccionado no existe" }, { status: 404 });
      }
      if (session.role === "CLIENT" && qr.userId !== session.id) {
        return NextResponse.json({ error: "No tiene permisos sobre el código QR seleccionado" }, { status: 403 });
      }
    }

    if (session.role === "CLIENT") {
      const count = await prisma.cardDesign.count({ where: { userId: session.id } });
      if (count >= MAX_CARDS_PER_CLIENT) {
        return NextResponse.json({ error: "Alcanzó el límite de diseños de tarjeta." }, { status: 403 });
      }
    }

    const card = await prisma.cardDesign.create({
      data: {
        name,
        config: config as any,
        qrCodeId: config.qrCodeId,
        userId: session.id,
      },
    });

    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (error) {
    console.error("Error al crear diseño de tarjeta:", error);
    return NextResponse.json({ error: "Error al guardar el diseño" }, { status: 500 });
  }
}
