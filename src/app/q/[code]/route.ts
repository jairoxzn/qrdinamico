import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashIp, parseUserAgentInfo, validateDestinationUrl } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const shortCode = params.code;

  if (!shortCode || typeof shortCode !== "string") {
    return new NextResponse("Identificador de código QR no válido", { status: 400 });
  }

  try {
    // 1. Buscar el código QR por shortCode
    const qr = await prisma.qRCode.findUnique({
      where: { shortCode },
      include: {
        nfcCards: true,
      },
    });

    // 2. Si no existe, mostrar pantalla de no encontrado
    if (!qr) {
      const notFoundUrl = new URL(`/q/not-found?code=${encodeURIComponent(shortCode)}`, request.url);
      return NextResponse.redirect(notFoundUrl);
    }

    // 3. Validar estado del código QR
    if (qr.status === "SUSPENDED" || qr.status === "ARCHIVED") {
      const suspendedUrl = new URL(`/q/${encodeURIComponent(shortCode)}/suspended`, request.url);
      return NextResponse.redirect(suspendedUrl);
    }

    // 4. Extraer metadatos para analítica
    const searchParams = request.nextUrl.searchParams;
    const sourceParam = searchParams.get("src")?.toUpperCase() || (request.headers.get("referer")?.includes("nfc") ? "NFC" : "QR");
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    
    // IP extraction
    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    const ipHashed = hashIp(rawIp);

    const { deviceType, browser, os } = parseUserAgentInfo(userAgent);

    // Country/City from cloud headers if available (e.g. Cloudflare, Vercel, AWS)
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      "Colombia";
    const city =
      request.headers.get("cf-ipcity") ||
      request.headers.get("x-vercel-ip-city") ||
      "Local";

    // 5. Registrar el escaneo e incrementar contador (sin bloquear la redirección de forma asíncrona)
    const updatePromises: Promise<any>[] = [
      prisma.qRCode.update({
        where: { id: qr.id },
        data: {
          scanCount: { increment: 1 },
          lastScannedAt: new Date(),
        },
      }),
      prisma.scanLog.create({
        data: {
          qrCodeId: qr.id,
          ipHash: ipHashed,
          deviceType,
          browser,
          os,
          referer: referer || (sourceParam === "NFC" ? "nfc://tag-tap" : "direct://camera-scan"),
          userAgent: userAgent.substring(0, 255),
          country,
          city,
          source: sourceParam === "NFC" ? "NFC" : "QR",
          scannedAt: new Date(),
        },
      }),
    ];

    // Si vino de una tarjeta NFC asociada o el parámetro es nfc, actualizar la tarjeta
    if (sourceParam === "NFC" && qr.nfcCards.length > 0) {
      updatePromises.push(
        prisma.nfcCard.updateMany({
          where: { qrCodeId: qr.id },
          data: { lastTappedAt: new Date() },
        })
      );
    }

    // Ejecutar registro de analíticas
    await Promise.allSettled(updatePromises);

    // 6. Validar seguridad del destino antes de redirigir
    const validation = validateDestinationUrl(qr.destinationUrl);
    const targetUrl = validation.isValid && validation.normalizedUrl ? validation.normalizedUrl : qr.destinationUrl;

    // 7. Redirigir mediante respuesta HTTP 307 (Temporary Redirect)
    // No-cache headers garantizan que la redirección no se guarde en caché del navegador
    return NextResponse.redirect(targetUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error al procesar redirección dinámica de QR:", error);
    return new NextResponse("Error al procesar la redirección.", { status: 500 });
  }
}

