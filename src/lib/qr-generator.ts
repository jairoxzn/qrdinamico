import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { getDynamicQrUrl } from "./utils";

export interface QROptions {
  shortCode: string;
  fgColor?: string;
  bgColor?: string;
  dotStyle?: "square" | "rounded" | "dots";
  cornerSquareStyle?: "square" | "rounded" | "extra-rounded";
  margin?: number;
  width?: number;
  logoUrl?: string | null;
}

/**
 * Generates an SVG string representation of the dynamic QR code with custom colors and styling.
 */
export async function generateQrSvg(options: QROptions): Promise<string> {
  const dynamicUrl = getDynamicQrUrl(options.shortCode);
  const fg = options.fgColor || "#010B47";
  const bg = options.bgColor || "#FFFFFF";
  const margin = options.margin ?? 2;

  // Generate basic SVG string from qrcode library
  const rawSvg = await QRCode.toString(dynamicUrl, {
    type: "svg",
    color: {
      dark: fg,
      light: bg,
    },
    margin,
    errorCorrectionLevel: "H", // High error correction to allow logos/custom styling
  });

  return rawSvg;
}

/**
 * Generates a PNG Data URL of the dynamic QR code.
 */
export async function generateQrDataUrl(options: QROptions): Promise<string> {
  const dynamicUrl = getDynamicQrUrl(options.shortCode);
  const fg = options.fgColor || "#010B47";
  const bg = options.bgColor || "#FFFFFF";
  const width = options.width || 600;
  const margin = options.margin ?? 2;

  return await QRCode.toDataURL(dynamicUrl, {
    width,
    margin,
    color: {
      dark: fg,
      light: bg,
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Generates a ready-to-print vector PDF for NFC Cards, Table Tents or Stickers.
 */
export async function generatePrintablePdf(
  options: QROptions,
  title: string,
  clientCompany?: string
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const qrDataUrl = await generateQrDataUrl({
    ...options,
    width: 1000,
  });

  // Background header band
  doc.setFillColor(1, 11, 71); // #010B47
  doc.rect(0, 0, 210, 35, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NFC SMART QR MANAGER", 20, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("XhionSoft Technologies — Soluciones NFC & QR Dinámico", 20, 26);

  // Card Container / Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 50, 150, 200, 5, 5, "FD");

  // Title of the QR
  doc.setTextColor(1, 11, 71);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 105, 75, { align: "center" });

  if (clientCompany) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(clientCompany, 105, 83, { align: "center" });
  }

  // QR Image
  doc.addImage(qrDataUrl, "PNG", 60, 95, 90, 90);

  // Shortcode pill
  doc.setFillColor(235, 243, 255); // #EBF3FF
  doc.roundedRect(70, 192, 70, 10, 3, 3, "F");
  doc.setTextColor(2, 92, 243); // #025CF3
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text(`/q/${options.shortCode}`, 105, 198.5, { align: "center" });

  // NFC & Scan Call To Action
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Escanea con tu cámara o acerca tu tarjeta NFC", 105, 215, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Compatible con todos los smartphones iOS y Android modernos.", 105, 222, { align: "center" });
  doc.text("URL dinámica gestionada centralmente desde la plataforma.", 105, 228, { align: "center" });

  // Footer branding
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text("Generado por XhionSoft Technologies • www.xhionsoft.com", 105, 280, { align: "center" });

  return doc;
}

