import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  maxQRs: z.number().int().min(1).default(50),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso reservado para administradores" }, { status: 403 });
    }

    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
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
        _count: {
          select: {
            qrCodes: true,
            nfcCards: true,
          },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error al listar clientes:", error);
    return NextResponse.json({ error: "Error al listar clientes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso reservado para administradores" }, { status: 403 });
    }

    const body = await request.json();
    const result = createClientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con este correo electrónico" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newClient = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        role: "CLIENT",
        status: "ACTIVE",
        company: data.company || null,
        phone: data.phone || null,
        maxQRs: data.maxQRs || 50,
      },
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

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: "Error interno al crear cliente" }, { status: 500 });
  }
}

