const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function validateDestinationUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") {
    return { isValid: false, error: "La URL de destino es obligatoria." };
  }
  const trimmed = urlStr.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { isValid: false, error: "Protocolo no permitido por seguridad." };
  }
  try {
    let toParse = trimmed;
    if (!toParse.startsWith("http://") && !toParse.startsWith("https://")) {
      toParse = `https://${toParse}`;
    }
    const parsed = new URL(toParse);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Solo se permiten enlaces con protocolo HTTP o HTTPS." };
    }
    return { isValid: true, normalizedUrl: parsed.toString() };
  } catch {
    return { isValid: false, error: "El formato de la URL no es válido." };
  }
}

async function runTests() {
  console.log("=== INICIANDO PRUEBAS E2E DEL SISTEMA NFC SMART QR MANAGER ===\n");
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Validar conexión a PostgreSQL (Neon DB)
    const userCount = await prisma.user.count();
    assert(userCount >= 2, `Conexión a Neon PostgreSQL exitosa (${userCount} usuarios encontrados)`);

    // 2. Probar autenticación de ADMIN y CLIENTE
    const admin = await prisma.user.findUnique({ where: { email: "admin@xhionsoft.com" } });
    assert(admin !== null && admin.role === "ADMIN", "Usuario Administrador verificado");
    const adminPassOk = await bcrypt.compare("adminpassword123", admin.passwordHash);
    assert(adminPassOk === true, "Verificación de contraseña encriptada (bcrypt) de Administrador");

    const client = await prisma.user.findUnique({ where: { email: "cliente@innovacion.com" } });
    assert(client !== null && client.role === "CLIENT", "Usuario Cliente verificado");
    const clientPassOk = await bcrypt.compare("clientepassword123", client.passwordHash);
    assert(clientPassOk === true, "Verificación de contraseña encriptada de Cliente");

    // 3. Probar búsqueda de QR y redirección dinámica
    const activeQr = await prisma.qRCode.findUnique({
      where: { shortCode: "ceo-card" },
      include: { nfcCards: true },
    });
    assert(activeQr !== null, "Búsqueda de QR activo 'ceo-card' en base de datos");
    assert(activeQr.status === "ACTIVE", "Estado del QR es ACTIVE");
    assert(activeQr.destinationUrl.startsWith("https://"), "URL de destino tiene protocolo HTTPS seguro");

    // Simular escaneo de cámara QR
    const initialScans = activeQr.scanCount;
    await prisma.qRCode.update({
      where: { id: activeQr.id },
      data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
    });
    const scanLog = await prisma.scanLog.create({
      data: {
        qrCodeId: activeQr.id,
        deviceType: "Mobile",
        browser: "Chrome Mobile 128",
        os: "Android 14",
        source: "QR",
        city: "Bogotá",
        country: "Colombia",
      },
    });
    assert(scanLog.id !== null, "Registro de auditoría de escaneo (ScanLog) creado exitosamente");

    const refreshedQr = await prisma.qRCode.findUnique({ where: { id: activeQr.id } });
    assert(refreshedQr.scanCount === initialScans + 1, "Contador de escaneos incrementado inmediatamente");

    // 4. Probar actualización inmediata de destino y registro en historial
    const newTestDestination = "https://www.xhionsoft.com/nuevo-lanzamiento-2026";
    const historyEntry = await prisma.destinationHistory.create({
      data: {
        qrCodeId: activeQr.id,
        oldUrl: activeQr.destinationUrl,
        newUrl: newTestDestination,
        changedById: admin.id,
        reason: "Prueba automatizada de actualización en caliente",
      },
    });
    await prisma.qRCode.update({
      where: { id: activeQr.id },
      data: { destinationUrl: newTestDestination },
    });
    assert(historyEntry.id !== null, "Pista de auditoría de cambio de destino registrada en DestinationHistory");

    const updatedQr = await prisma.qRCode.findUnique({ where: { id: activeQr.id } });
    assert(updatedQr.destinationUrl === newTestDestination, "Nuevo destino reflejado inmediatamente en PostgreSQL");

    // Restaurar destino original
    await prisma.qRCode.update({
      where: { id: activeQr.id },
      data: { destinationUrl: "https://www.linkedin.com/company/xhionsoft" },
    });

    // 5. Probar comportamiento con QR Suspendido
    const suspendedQr = await prisma.qRCode.findUnique({ where: { shortCode: "promo-stand" } });
    assert(suspendedQr !== null && suspendedQr.status === "SUSPENDED", "Identificación de código QR suspendido");

    // 6. Probar vinculación física con tarjeta NFC
    const nfcCard = await prisma.nfcCard.findFirst({
      where: { qrCodeId: activeQr.id },
    });
    assert(nfcCard !== null, `Tarjeta NFC (${nfcCard.uid}) asociada correctamente al código QR`);
    assert(nfcCard.status === "ASSIGNED", "Estado de la tarjeta NFC es ASSIGNED");

    // 7. Pruebas de seguridad: Validación de URL y prevención de ataques
    assert(validateDestinationUrl("javascript:alert(1)").isValid === false, "Bloqueo de protocolo malicioso javascript:");
    assert(validateDestinationUrl("data:text/html,<script>").isValid === false, "Bloqueo de protocolo malicioso data:");
    assert(validateDestinationUrl("https://xhionsoft.com/contacto").isValid === true, "Aprobación de URL HTTPS válida");

    console.log(`\n========================================`);
    console.log(`RESUMEN: ${passed} / ${total} PRUEBAS EXITOSAS (${((passed / total) * 100).toFixed(0)}%)`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error("Error durante las pruebas:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
