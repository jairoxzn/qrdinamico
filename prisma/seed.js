const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed para NFC Smart QR Manager (JAIROSYSTEN)...");

  // Limpiar datos previos si existen
  await prisma.scanLog.deleteMany({});
  await prisma.destinationHistory.deleteMany({});
  await prisma.nfcCard.deleteMany({});
  await prisma.qRCode.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const clientPasswordHash = await bcrypt.hash("clientepassword123", 10);

  // 1. Crear usuarios
  const admin = await prisma.user.create({
    data: {
      name: "Administrador JAIROSYSTEN",
      email: "admin@jairosysten.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      company: "JAIROSYSTEN",
      phone: "+57 300 123 4567",
      maxQRs: 1000,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      name: "Carlos Mendoza",
      email: "cliente@innovacion.com",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
      status: "ACTIVE",
      company: "Innovación Retail S.A.S",
      phone: "+57 311 987 6543",
      maxQRs: 50,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: "Valentina Gómez",
      email: "valentina@gastronomia.com",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
      status: "ACTIVE",
      company: "Grupo Gastronómico El Roble",
      phone: "+57 315 555 8899",
      maxQRs: 30,
    },
  });

  console.log("Usuarios creados con éxito.");

  // 2. Crear Códigos QR Dinámicos
  const qr1 = await prisma.qRCode.create({
    data: {
      shortCode: "ceo-card",
      title: "Tarjeta Ejecutiva CEO",
      description: "NFC y QR de contacto directo para eventos y networking.",
      category: "Networking & Tarjetas",
      destinationUrl: "https://www.linkedin.com/company/xhionsoft",
      status: "ACTIVE",
      scanCount: 142,
      fgColor: "#010B47",
      bgColor: "#FFFFFF",
      dotStyle: "rounded",
      cornerSquareStyle: "rounded",
      userId: admin.id,
      lastScannedAt: new Date(),
    },
  });

  const qr2 = await prisma.qRCode.create({
    data: {
      shortCode: "menu-gourmet",
      title: "Menú Digital Mesa 01",
      description: "Carta interactiva con platos recomendados de la semana.",
      category: "Restaurante",
      destinationUrl: "https://menu.elroblegourmet.com/mesa-01",
      status: "ACTIVE",
      scanCount: 389,
      fgColor: "#025CF3",
      bgColor: "#FFFFFF",
      dotStyle: "dots",
      cornerSquareStyle: "extra-rounded",
      userId: client2.id,
      lastScannedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
  });

  const qr3 = await prisma.qRCode.create({
    data: {
      shortCode: "catalogo-2025",
      title: "Catálogo Mayorista 2025",
      description: "Catálogo PDF interactivo con descuentos por volumen.",
      category: "Comercial",
      destinationUrl: "https://catalogo.innovacionretail.com/verano-2025",
      status: "ACTIVE",
      scanCount: 78,
      fgColor: "#0F172A",
      bgColor: "#F8FAFC",
      dotStyle: "square",
      cornerSquareStyle: "square",
      userId: client1.id,
      lastScannedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  const qr4 = await prisma.qRCode.create({
    data: {
      shortCode: "promo-stand",
      title: "Promoción Feria Empresarial",
      description: "Código QR para sorteo especial en feria corporativa.",
      category: "Eventos",
      destinationUrl: "https://landing.xhionsoft.com/feria-sorteo",
      status: "SUSPENDED",
      scanCount: 215,
      fgColor: "#DC2626",
      bgColor: "#FFFFFF",
      dotStyle: "rounded",
      cornerSquareStyle: "rounded",
      userId: admin.id,
      lastScannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  });

  console.log("Códigos QR creados con éxito.");

  // 3. Crear Tarjetas NFC asociadas y no asociadas
  await prisma.nfcCard.create({
    data: {
      uid: "04:A1:B2:C3:D4:E5:F6",
      label: "Tarjeta NFC Metal Black - CEO",
      model: "NTAG216",
      batch: "LOTE-2025-01",
      status: "ASSIGNED",
      qrCodeId: qr1.id,
      userId: admin.id,
      lastTappedAt: new Date(),
      notes: "Tarjeta ejecutiva en aluminio anodizado negro con chip NTAG216 de 888 bytes.",
    },
  });

  await prisma.nfcCard.create({
    data: {
      uid: "04:77:88:99:AA:BB:CC",
      label: "Sticker NFC Acrílico Mesa 01",
      model: "NTAG213",
      batch: "LOTE-2024-11",
      status: "ASSIGNED",
      qrCodeId: qr2.id,
      userId: client2.id,
      lastTappedAt: new Date(Date.now() - 1000 * 60 * 30),
      notes: "Sticker anti-metal adherido al soporte de madera de la mesa 1.",
    },
  });

  await prisma.nfcCard.create({
    data: {
      uid: "04:12:34:56:78:9A:BC",
      label: "Tarjeta PVC Impresa - Retail Mayorista",
      model: "NTAG215",
      batch: "LOTE-2025-02",
      status: "ASSIGNED",
      qrCodeId: qr3.id,
      userId: client1.id,
      lastTappedAt: new Date(Date.now() - 1000 * 60 * 180),
      notes: "Entregada al equipo de ventas para demostraciones de catálogo.",
    },
  });

  await prisma.nfcCard.create({
    data: {
      uid: "04:DE:AD:BE:EF:01:02:03",
      label: "Tarjeta NFC Virgen Sin Asignar #01",
      model: "NTAG215",
      batch: "LOTE-2025-03",
      status: "UNASSIGNED",
      userId: admin.id,
      notes: "Inventario disponible para nuevo cliente.",
    },
  });

  console.log("Tarjetas NFC creadas con éxito.");

  // 4. Historial de modificaciones de destino
  await prisma.destinationHistory.create({
    data: {
      qrCodeId: qr1.id,
      oldUrl: "https://xhionsoft.com/contacto-directo",
      newUrl: "https://www.linkedin.com/company/xhionsoft",
      changedById: admin.id,
      reason: "Actualización a perfil LinkedIn verificado para evento de tecnología.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  await prisma.destinationHistory.create({
    data: {
      qrCodeId: qr2.id,
      oldUrl: "https://menu.elroblegourmet.com/carta-clasica",
      newUrl: "https://menu.elroblegourmet.com/mesa-01",
      changedById: client2.id,
      reason: "Configuración de pedido directo por mesa y carta de temporada.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  // 5. Escaneos reales de prueba (ScanLogs)
  const devices = [
    { type: "Mobile", os: "iOS 17.4", browser: "Safari 17.0" },
    { type: "Mobile", os: "Android 14", browser: "Chrome Mobile 128" },
    { type: "Mobile", os: "Android 13", browser: "Samsung Browser 24" },
    { type: "Desktop", os: "Windows 11", browser: "Chrome 128" },
    { type: "Desktop", os: "macOS Sonoma", browser: "Safari 17.2" },
    { type: "Tablet", os: "iPadOS 17", browser: "Safari 17.0" },
  ];

  const sources = ["QR", "NFC", "QR", "QR", "NFC"];
  const cities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Miami", "Madrid"];

  const qrs = [qr1, qr2, qr3, qr4];

  const now = Date.now();
  for (let i = 0; i < 45; i++) {
    const qr = qrs[Math.floor(Math.random() * qrs.length)];
    const dev = devices[Math.floor(Math.random() * devices.length)];
    const src = sources[Math.floor(Math.random() * sources.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const timeOffset = Math.floor(Math.random() * 7 * 24 * 3600 * 1000); // En los últimos 7 días

    await prisma.scanLog.create({
      data: {
        qrCodeId: qr.id,
        deviceType: dev.type,
        os: dev.os,
        browser: dev.browser,
        country: "Colombia",
        city: city,
        source: src,
        referer: src === "NFC" ? "nfc-tap://device" : "https://camera.lens.google.com",
        userAgent: `Mozilla/5.0 (${dev.os}) ${dev.browser}`,
        scannedAt: new Date(now - timeOffset),
      },
    });
  }

  // 6. System settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "company_name", value: "JAIROSYSTEN" },
      { key: "support_email", value: "soporte@jairosysten.com" },
      { key: "default_redirect_delay_ms", value: "0" },
      { key: "allow_client_registration", value: "false" },
    ],
  });

  console.log("¡Seed ejecutado exitosamente con datos completos y reales!");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

