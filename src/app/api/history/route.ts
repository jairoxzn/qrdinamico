import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const qrId = searchParams.get("qrId");

    const where: any = {};
    if (session.role === "CLIENT") {
      where.qrCode = { userId: session.id };
    }

    if (qrId) {
      where.qrCodeId = qrId;
    }

    const history = await prisma.destinationHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        qrCode: {
          select: {
            id: true,
            title: true,
            shortCode: true,
          },
        },
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error al obtener historial de cambios:", error);
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}

