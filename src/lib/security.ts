import crypto from "crypto";
import { UAParser } from "ua-parser-js";

/**
 * Validates destination URLs against malicious protocols (e.g. javascript:, data:, vbscript:)
 * Only allows valid http:// and https:// protocols.
 */
export function validateDestinationUrl(urlStr: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
  if (!urlStr || typeof urlStr !== "string") {
    return { isValid: false, error: "La URL de destino es obligatoria." };
  }

  const trimmed = urlStr.trim();

  // Basic check for dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { isValid: false, error: "Protocolo no permitido por seguridad." };
  }

  let parsed: URL;
  try {
    // If user forgot protocol, prepend https://
    let toParse = trimmed;
    if (!toParse.startsWith("http://") && !toParse.startsWith("https://")) {
      toParse = `https://${toParse}`;
    }
    parsed = new URL(toParse);
  } catch {
    return { isValid: false, error: "El formato de la URL no es válido." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Solo se permiten enlaces con protocolo HTTP o HTTPS." };
  }

  // Prevent local/loopback redirects in production
  if (
    process.env.NODE_ENV === "production" &&
    (parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0" ||
      parsed.hostname.startsWith("192.168.") ||
      parsed.hostname.startsWith("10."))
  ) {
    return { isValid: false, error: "No se permiten redirecciones a direcciones IP de red local." };
  }

  return { isValid: true, normalizedUrl: parsed.toString() };
}

/**
 * Creates a GDPR-friendly cryptographic hash of an IP address.
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.AUTH_SECRET || "xhionsoft_ip_salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").substring(0, 16);
}

/**
 * Parses user agent string to extract device, OS, and browser.
 */
export function parseUserAgentInfo(userAgentString?: string | null): {
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot" | "Other";
  browser: string;
  os: string;
} {
  if (!userAgentString) {
    return {
      deviceType: "Other",
      browser: "Desconocido",
      os: "Desconocido",
    };
  }

  const parser = new UAParser(userAgentString);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  let deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot" | "Other" = "Desktop";

  if (device.type === "mobile") {
    deviceType = "Mobile";
  } else if (device.type === "tablet") {
    deviceType = "Tablet";
  } else if (/bot|crawler|spider|crawling/i.test(userAgentString)) {
    deviceType = "Bot";
  } else if (!device.type) {
    // Check if mobile in UA
    if (/Mobile|Android|iP(hone|od)/i.test(userAgentString)) {
      deviceType = "Mobile";
    } else if (/iPad|Tablet/i.test(userAgentString)) {
      deviceType = "Tablet";
    }
  }

  const browserName = browser.name ? `${browser.name} ${browser.major || ""}`.trim() : "Navegador Web";
  const osName = os.name ? `${os.name} ${os.version || ""}`.trim() : "Sistema Operativo";

  return {
    deviceType,
    browser: browserName,
    os: osName,
  };
}

