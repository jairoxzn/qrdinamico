import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
        nfcCards: true,
      },
    });

    if (!qr) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 });
    }

    if (session.role === "CLIENT" && qr.userId !== session.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener los logs de escaneo
    const scans = await prisma.scanLog.findMany({
      where: { qrCodeId: params.id },
      orderBy: { scannedAt: "desc" },
    });

    // 1. Agrupar por días (últimos 7 días)
    const daysMap = new Map<string, { date: string; total: number; qr: number; nfc: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric" }).format(d);
      daysMap.set(key, { date: label, total: 0, qr: 0, nfc: 0 });
    }

    // 2. Dispositivos, Navegadores, SO y Fuentes
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    let qrCount = 0;
    let nfcCount = 0;

    for (const scan of scans) {
      const dateKey = scan.scannedAt.toISOString().split("T")[0];
      if (daysMap.has(dateKey)) {
        const item = daysMap.get(dateKey)!;
        item.total++;
        if (scan.source === "NFC") item.nfc++;
        else item.qr++;
      }

      const dev = scan.deviceType || "Otro";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

      const br = scan.browser ? scan.browser.split(" ")[0] : "Otro";
      browserCounts[br] = (browserCounts[br] || 0) + 1;

      const os = scan.os ? scan.os.split(" ")[0] : "Otro";
      osCounts[os] = (osCounts[os] || 0) + 1;

      if (scan.source === "NFC") nfcCount++;
      else qrCount++;
    }

    const dailyChart = Array.from(daysMap.values());
    const deviceChart = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
    const browserChart = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));
    const osChart = Object.entries(osCounts).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      qrInfo: {
        id: qr.id,
        shortCode: qr.shortCode,
        title: qr.title,
        destinationUrl: qr.destinationUrl,
        scanCount: qr.scanCount,
        status: qr.status,
        lastScannedAt: qr.lastScannedAt,
        associatedNfcCount: qr.nfcCards.length,
      },
      summary: {
        totalScans: scans.length,
        qrScans: qrCount,
        nfcTaps: nfcCount,
      },
      dailyChart,
      deviceChart,
      browserChart,
      osChart,
      recentLogs: scans.slice(0, 30),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del QR:", error);
    return NextResponse.json({ error: "Error al cargar analíticas" }, { status: 500 });
  }
}

