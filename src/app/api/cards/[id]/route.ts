import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cardPayloadSchema } from "@/lib/card-design";

export const dynamic = "force-dynamic";

async function loadOwned(id: string) {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };

  const card = await prisma.cardDesign.findUnique({ where: { id } });
  if (!card) return { error: NextResponse.json({ error: "Diseño no encontrado" }, { status: 404 }) };

  if (session.role === "CLIENT" && card.userId !== session.id) {
    return { error: NextResponse.json({ error: "No tiene permisos sobre este diseño" }, { status: 403 }) };
  }
  return { session, card };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const r = await loadOwned(params.id);
    if (r.error) return r.error;
    return NextResponse.json({ card: r.card });
  } catch (error) {
    console.error("Error al obtener diseño de tarjeta:", error);
    return NextResponse.json({ error: "Error al obtener el diseño" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const r = await loadOwned(params.id);
    if (r.error) return r.error;
    const { session } = r;

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
      if (session!.role === "CLIENT" && qr.userId !== session!.id) {
        return NextResponse.json({ error: "No tiene permisos sobre el código QR seleccionado" }, { status: 403 });
      }
    }

    const card = await prisma.cardDesign.update({
      where: { id: params.id },
      data: { name, config: config as any, qrCodeId: config.qrCodeId },
    });

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error("Error al actualizar diseño de tarjeta:", error);
    return NextResponse.json({ error: "Error al actualizar el diseño" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const r = await loadOwned(params.id);
    if (r.error) return r.error;
    await prisma.cardDesign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar diseño de tarjeta:", error);
    return NextResponse.json({ error: "Error al eliminar el diseño" }, { status: 500 });
  }
}
