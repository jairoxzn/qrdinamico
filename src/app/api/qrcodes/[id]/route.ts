import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateDestinationUrl } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateQrSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  destinationUrl: z.string().min(3).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).optional(),
  changeReason: z.string().max(255).optional(),
  fgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  dotStyle: z.enum(["square", "rounded", "dots"]).optional(),
  cornerSquareStyle: z.enum(["square", "rounded", "extra-rounded"]).optional(),
  logoUrl: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const qr = await prisma.qRCode.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        nfcCards: true,
        history: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            scans: true,
            nfcCards: true,
          },
        },
      },
    });

    if (!qr) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 });
    }

    // Proteger privacidad: cliente no puede ver QR de otro cliente
    if (session.role === "CLIENT" && qr.userId !== session.id) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    return NextResponse.json({ qr });
  } catch (error) {
    console.error("Error al obtener detalle del código QR:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const qr = await prisma.qRCode.findUnique({
      where: { id: params.id },
    });

    if (!qr) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 });
    }

    // Proteger: cliente solo puede modificar su propio QR
    if (session.role === "CLIENT" && qr.userId !== session.id) {
      return NextResponse.json({ error: "No tiene permisos para modificar este código QR" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateQrSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const updatePayload: any = {};

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.fgColor !== undefined) updatePayload.fgColor = data.fgColor;
    if (data.bgColor !== undefined) updatePayload.bgColor = data.bgColor;
    if (data.dotStyle !== undefined) updatePayload.dotStyle = data.dotStyle;
    if (data.cornerSquareStyle !== undefined) updatePayload.cornerSquareStyle = data.cornerSquareStyle;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;

    // Si cambió la URL de destino, validar y registrar en historial
    let destinationChanged = false;
    let oldUrl = qr.destinationUrl;
    let newUrl = "";

    if (data.destinationUrl && data.destinationUrl.trim() !== qr.destinationUrl) {
      const urlCheck = validateDestinationUrl(data.destinationUrl);
      if (!urlCheck.isValid || !urlCheck.normalizedUrl) {
        return NextResponse.json(
          { error: urlCheck.error || "URL de destino inválida o no permitida" },
          { status: 400 }
        );
      }
      destinationChanged = true;
      newUrl = urlCheck.normalizedUrl;
      updatePayload.destinationUrl = newUrl;
    }

    // Transacción para actualizar QR y guardar en el historial
    const updatedQr = await prisma.$transaction(async (tx) => {
      const modified = await tx.qRCode.update({
        where: { id: params.id },
        data: updatePayload,
      });

      if (destinationChanged) {
        await tx.destinationHistory.create({
          data: {
            qrCodeId: params.id,
            oldUrl,
            newUrl,
            changedById: session.id,
            reason: data.changeReason || "Modificación de destino desde el panel",
          },
        });
      }

      return modified;
    });

    return NextResponse.json({
      success: true,
      message: destinationChanged
        ? "Destino actualizado exitosamente y registrado en el historial"
        : "Código QR actualizado con éxito",
      qr: updatedQr,
    });
  } catch (error) {
    console.error("Error al actualizar código QR:", error);
    return NextResponse.json({ error: "Error al actualizar código QR" }, { status: 500 });
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

    const qr = await prisma.qRCode.findUnique({
      where: { id: params.id },
    });

    if (!qr) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 });
    }

    if (session.role === "CLIENT" && qr.userId !== session.id) {
      return NextResponse.json({ error: "No tiene permisos para eliminar este código QR" }, { status: 403 });
    }

    await prisma.qRCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Código QR eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar código QR:", error);
    return NextResponse.json({ error: "Error al eliminar código QR" }, { status: 500 });
  }
}

