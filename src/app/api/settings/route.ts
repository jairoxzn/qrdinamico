import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
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
      },
    });

    let systemSettings: any[] = [];
    if (session.role === "ADMIN") {
      systemSettings = await prisma.systemSetting.findMany();
    }

    return NextResponse.json({ user, systemSettings });
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.phone !== undefined) updateData.phone = data.phone;

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "Debe ingresar su contraseña actual para establecer una nueva" },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      const match = await bcrypt.compare(data.currentPassword, dbUser.passwordHash);
      if (!match) {
        return NextResponse.json(
          { error: "La contraseña actual ingresada es incorrecta" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        company: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return NextResponse.json({ error: "Error al guardar cambios" }, { status: 500 });
  }
}

