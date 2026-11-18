import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashIp, parseUserAgentInfo, validateDestinationUrl } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * Ejecuta una promesa sin bloquear la respuesta. En Vercel usa waitUntil para
 * que la función no se congele antes de terminar; en servidores Node normales
 * la promesa simplemente continúa tras enviar la respuesta.
 */
function runInBackground(promise: Promise<unknown>) {
  const safe = promise.catch((e) => console.error("Tarea en segundo plano falló:", e));
  const ctx = (globalThis as any)[Symbol.for("@vercel/request-context")]?.get?.();
  if (ctx?.waitUntil) ctx.waitUntil(safe);
}

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
      null;
    const rawCity = request.headers.get("cf-ipcity") || request.headers.get("x-vercel-ip-city");
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    // 5. Registrar analíticas en segundo plano: la redirección NO espera a la BD
    const now = new Date();
    const isNfc = sourceParam === "NFC";
    const trackScan = async () => {
      const tasks: Promise<unknown>[] = [
        prisma.qRCode.update({
          where: { id: qr.id },
          data: { scanCount: { increment: 1 }, lastScannedAt: now },
        }),
        prisma.scanLog.create({
          data: {
            qrCodeId: qr.id,
            ipHash: ipHashed,
            deviceType,
            browser,
            os,
            referer: referer || (isNfc ? "nfc://tag-tap" : "direct://camera-scan"),
            userAgent: userAgent.substring(0, 255),
            country,
            city,
            source: isNfc ? "NFC" : "QR",
            scannedAt: now,
          },
        }),
      ];
      if (isNfc) {
        tasks.push(
          prisma.nfcCard.updateMany({
            where: { qrCodeId: qr.id },
            data: { lastTappedAt: now },
          })
        );
      }
      const results = await Promise.allSettled(tasks);
      for (const r of results) {
        if (r.status === "rejected") console.error("Error registrando escaneo:", r.reason);
      }
    };
    // Los bots (previsualizaciones de enlaces, crawlers) no cuentan como escaneos
    if (deviceType !== "Bot") runInBackground(trackScan());

    // 6. Validar el destino en cada redirección (protege datos antiguos o alterados)
    const validation = validateDestinationUrl(qr.destinationUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      console.error(`Destino inválido para QR ${qr.shortCode}: ${validation.error}`);
      return new NextResponse("El destino de este código no es válido.", { status: 422 });
    }
    const targetUrl = validation.normalizedUrl;

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

