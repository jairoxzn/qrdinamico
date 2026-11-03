import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateShortCode } from "@/lib/utils";
import { validateDestinationUrl } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createQrSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  destinationUrl: z.string().min(3, "La URL de destino es obligatoria"),
  fgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido").optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido").optional(),
  dotStyle: z.enum(["square", "rounded", "dots"]).optional(),
  cornerSquareStyle: z.enum(["square", "rounded", "extra-rounded"]).optional(),
  logoUrl: z.string().optional().nullable(),
  targetUserId: z.string().optional(), // Solo ADMIN puede asignar a otro cliente
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
    const category = searchParams.get("category");
    const userIdFilter = searchParams.get("userId");

    // Construir filtro de consulta
    const where: any = {};

    // Si es CLIENT, sólo puede ver los suyos
    if (session.role === "CLIENT") {
      where.userId = session.id;
    } else if (userIdFilter) {
      // ADMIN filtrando por cliente específico
      where.userId = userIdFilter;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortCode: { contains: search, mode: "insensitive" } },
        { destinationUrl: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const qrcodes = await prisma.qRCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
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
        _count: {
          select: {
            scans: true,
            nfcCards: true,
            history: true,
          },
        },
      },
    });

    return NextResponse.json({ qrcodes });
  } catch (error) {
    console.error("Error al obtener códigos QR:", error);
    return NextResponse.json({ error: "Error al listar los códigos QR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = createQrSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Validar seguridad de la URL de destino
    const urlCheck = validateDestinationUrl(data.destinationUrl);
    if (!urlCheck.isValid || !urlCheck.normalizedUrl) {
      return NextResponse.json(
        { error: urlCheck.error || "URL de destino insegura o inválida." },
        { status: 400 }
      );
    }

    // Determinar propietario (Owner)
    let assignedUserId = session.id;
    if (session.role === "ADMIN" && data.targetUserId) {
      assignedUserId = data.targetUserId;
    }

    // Si es CLIENT, verificar cuota máxima permitida
    if (session.role === "CLIENT") {
      const currentCount = await prisma.qRCode.count({
        where: { userId: session.id },
      });
      if (currentCount >= session.maxQRs) {
        return NextResponse.json(
          {
            error: `Ha alcanzado el límite de ${session.maxQRs} códigos QR permitidos para su cuenta. Contacte a soporte para ampliar su cuota.`,
          },
          { status: 403 }
        );
      }
    }

    // Generar shortCode único garantizado
    let shortCode = generateShortCode(8);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.qRCode.findUnique({ where: { shortCode } });
      if (!existing) break;
      shortCode = generateShortCode(8);
      attempts++;
    }

    const qr = await prisma.qRCode.create({
      data: {
        shortCode,
        title: data.title,
        description: data.description || null,
        category: data.category || "General",
        destinationUrl: urlCheck.normalizedUrl,
        fgColor: data.fgColor || "#010B47",
        bgColor: data.bgColor || "#FFFFFF",
        dotStyle: data.dotStyle || "square",
        cornerSquareStyle: data.cornerSquareStyle || "square",
        logoUrl: data.logoUrl || null,
        status: "ACTIVE",
        userId: assignedUserId,
      },
      include: {
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

    return NextResponse.json({ success: true, qr }, { status: 201 });
  } catch (error) {
    console.error("Error al crear código QR:", error);
    return NextResponse.json({ error: "Error al crear el código QR" }, { status: 500 });
  }
}

