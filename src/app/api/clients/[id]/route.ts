import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  maxQRs: z.number().int().min(1).optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const client = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        company: true,
        phone: true,
        maxQRs: true,
        createdAt: true,
        qrCodes: {
          select: {
            id: true,
            title: true,
            shortCode: true,
            destinationUrl: true,
            status: true,
            scanCount: true,
            createdAt: true,
          },
        },
        nfcCards: {
          select: {
            id: true,
            uid: true,
            label: true,
            model: true,
            status: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateClientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.maxQRs !== undefined) updateData.maxQRs = data.maxQRs;

    if (data.newPassword) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        company: true,
        phone: true,
        maxQRs: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Cliente y sus recursos eliminados" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}

