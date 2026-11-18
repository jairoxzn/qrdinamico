import type { Options } from "qr-code-styling";

export const DOT_STYLES = [
  { id: "square", name: "Cuadrado" },
  { id: "rounded", name: "Redondeado" },
  { id: "dots", name: "Puntos" },
  { id: "classy", name: "Elegante" },
  { id: "classy-rounded", name: "Elegante suave" },
  { id: "extra-rounded", name: "Líquido" },
] as const;

// Los ids se mantienen por compatibilidad con los QR ya guardados en la BD
export const CORNER_STYLES = [
  { id: "square", name: "Cuadrado" },
  { id: "rounded", name: "Redondeado" },
  { id: "extra-rounded", name: "Circular" },
] as const;

export const DOT_STYLE_IDS = DOT_STYLES.map((s) => s.id) as unknown as [string, ...string[]];
export const CORNER_STYLE_IDS = CORNER_STYLES.map((s) => s.id) as unknown as [string, ...string[]];

export const MAX_LOGO_CHARS = 150_000;

export interface QrStyleInput {
  data: string;
  fgColor?: string | null;
  bgColor?: string | null;
  dotStyle?: string | null;
  cornerSquareStyle?: string | null;
  logoUrl?: string | null;
  size?: number;
}

const CORNER_SQUARE_MAP: Record<string, "square" | "extra-rounded" | "dot"> = {
  square: "square",
  rounded: "extra-rounded",
  "extra-rounded": "dot",
};

/** Convierte el estilo guardado en la BD a las opciones de qr-code-styling. */
export function buildQrOptions(input: QrStyleInput): Options {
  const fg = input.fgColor || "#010B47";
  const bg = input.bgColor || "#FFFFFF";
  const corner = input.cornerSquareStyle || "square";
  const dot = DOT_STYLES.some((s) => s.id === input.dotStyle) ? input.dotStyle! : "square";
  const size = input.size || 600;

  return {
    width: size,
    height: size,
    type: "canvas",
    data: input.data,
    margin: Math.round(size * 0.04),
    qrOptions: { errorCorrectionLevel: "H" }, // permite logo y estilos sin perder lectura
    dotsOptions: { color: fg, type: dot as any },
    backgroundOptions: { color: bg },
    cornersSquareOptions: { color: fg, type: CORNER_SQUARE_MAP[corner] ?? "square" },
    cornersDotOptions: { color: fg, type: corner === "square" ? "square" : "dot" },
    image: input.logoUrl || undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: 0.28,
      margin: 4,
    },
  };
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16) || 0;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Devuelve un aviso si la combinación de colores puede dificultar el escaneo. */
export function contrastWarning(fg: string, bg: string): string | null {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  if (l1 > l2) return "El color de los puntos es más claro que el fondo: muchos lectores no escanearán este QR.";
  if (ratio < 4) return "Poco contraste entre puntos y fondo: use un color más oscuro para asegurar el escaneo.";
  return null;
}

/** Reduce el logo a un PNG de máx. 256px para que quepa en la BD y escanee rápido. */
export function fileToLogoDataUrl(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      reject(new Error("Use una imagen PNG, JPG o WEBP."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const out = canvas.toDataURL("image/png");
      if (out.length > MAX_LOGO_CHARS) reject(new Error("El logo es demasiado pesado. Use una imagen más simple."));
      else resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}
