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

    const isClient = session.role === "CLIENT";
    const userFilter = isClient ? { userId: session.id } : {};
    const qrFilter = isClient ? { qrCode: { userId: session.id } } : {};

    // 1. Métricas clave (KPIs)
    const [
      totalQRs,
      activeQRs,
      suspendedQRs,
      totalNfc,
      assignedNfc,
      totalScans,
      totalClients,
    ] = await Promise.all([
      prisma.qRCode.count({ where: userFilter }),
      prisma.qRCode.count({ where: { ...userFilter, status: "ACTIVE" } }),
      prisma.qRCode.count({ where: { ...userFilter, status: "SUSPENDED" } }),
      prisma.nfcCard.count({ where: userFilter }),
      prisma.nfcCard.count({ where: { ...userFilter, status: "ASSIGNED" } }),
      prisma.scanLog.count({ where: qrFilter }),
      isClient ? Promise.resolve(0) : prisma.user.count({ where: { role: "CLIENT" } }),
    ]);

    // 2. Escaneos hoy
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayScans = await prisma.scanLog.count({
      where: {
        ...qrFilter,
        scannedAt: { gte: startOfToday },
      },
    });

    // 3. Gráfico de últimos 7 días
    const daysMap = new Map<string, { date: string; scans: number; nfc: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric" }).format(d);
      daysMap.set(key, { date: label, scans: 0, nfc: 0 });
    }

    const recentScans = await prisma.scanLog.findMany({
      where: {
        ...qrFilter,
        scannedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { scannedAt: "asc" },
      select: {
        scannedAt: true,
        source: true,
        deviceType: true,
      },
    });

    const deviceCounts: Record<string, number> = {
      Mobile: 0,
      Desktop: 0,
      Tablet: 0,
    };

    for (const scan of recentScans) {
      const key = scan.scannedAt.toISOString().split("T")[0];
      if (daysMap.has(key)) {
        const item = daysMap.get(key)!;
        item.scans++;
        if (scan.source === "NFC") item.nfc++;
      }
      const dev = scan.deviceType || "Desktop";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    }

    const activityTimeline = Array.from(daysMap.values());
    const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // 4. Top 5 Códigos QR con mayor tráfico
    const topQRs = await prisma.qRCode.findMany({
      where: userFilter,
      orderBy: { scanCount: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        shortCode: true,
        destinationUrl: true,
        scanCount: true,
        status: true,
        lastScannedAt: true,
        _count: {
          select: { nfcCards: true },
        },
      },
    });

    // 5. Últimos 10 escaneos en tiempo real
    const latestScans = await prisma.scanLog.findMany({
      where: qrFilter,
      orderBy: { scannedAt: "desc" },
      take: 10,
      include: {
        qrCode: {
          select: {
            id: true,
            title: true,
            shortCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      kpis: {
        totalQRs,
        activeQRs,
        suspendedQRs,
        totalNfc,
        assignedNfc,
        unassignedNfc: totalNfc - assignedNfc,
        totalScans,
        todayScans,
        totalClients,
      },
      activityTimeline,
      deviceBreakdown,
      topQRs,
      latestScans,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 });
  }
}

