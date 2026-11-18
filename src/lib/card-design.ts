import { z } from "zod";
import {
  Plane,
  PlaneTakeoff,
  ShieldCheck,
  Car,
  MessageCircle,
  Briefcase,
  Star,
  MapPin,
  Phone,
  Utensils,
  ShoppingBag,
  Heart,
  Camera,
  Music,
  Home,
  Scissors,
  Dumbbell,
  Stethoscope,
  Wrench,
  Package,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Mail,
  Calendar,
  Gift,
  type LucideIcon,
} from "lucide-react";

export const CARD_ICONS: { id: string; name: string; Icon: LucideIcon }[] = [
  { id: "plane", name: "Viajes", Icon: Plane },
  { id: "plane-takeoff", name: "Aeropuerto", Icon: PlaneTakeoff },
  { id: "shield", name: "Seguridad", Icon: ShieldCheck },
  { id: "car", name: "Traslados", Icon: Car },
  { id: "message", name: "Mensajería", Icon: MessageCircle },
  { id: "briefcase", name: "Negocios", Icon: Briefcase },
  { id: "star", name: "Estrella", Icon: Star },
  { id: "map-pin", name: "Ubicación", Icon: MapPin },
  { id: "phone", name: "Teléfono", Icon: Phone },
  { id: "mail", name: "Correo", Icon: Mail },
  { id: "globe", name: "Web", Icon: Globe },
  { id: "instagram", name: "Instagram", Icon: Instagram },
  { id: "facebook", name: "Facebook", Icon: Facebook },
  { id: "youtube", name: "YouTube", Icon: Youtube },
  { id: "linkedin", name: "LinkedIn", Icon: Linkedin },
  { id: "utensils", name: "Comida", Icon: Utensils },
  { id: "shopping-bag", name: "Tienda", Icon: ShoppingBag },
  { id: "heart", name: "Salud / Amor", Icon: Heart },
  { id: "stethoscope", name: "Médico", Icon: Stethoscope },
  { id: "dumbbell", name: "Gimnasio", Icon: Dumbbell },
  { id: "scissors", name: "Belleza", Icon: Scissors },
  { id: "wrench", name: "Servicios", Icon: Wrench },
  { id: "home", name: "Inmobiliaria", Icon: Home },
  { id: "camera", name: "Foto / Video", Icon: Camera },
  { id: "music", name: "Música", Icon: Music },
  { id: "package", name: "Envíos", Icon: Package },
  { id: "calendar", name: "Reservas", Icon: Calendar },
  { id: "gift", name: "Promos", Icon: Gift },
];

export const CARD_ICON_IDS = CARD_ICONS.map((i) => i.id) as [string, ...string[]];

export const CARD_THEMES = [
  { id: "gold", name: "Negro y Oro", bgColor: "#0B0B0B", accentColor: "#D4A94B", textColor: "#FFFFFF" },
  { id: "silver", name: "Negro y Plata", bgColor: "#0E0F12", accentColor: "#C7CCD6", textColor: "#FFFFFF" },
  { id: "navy-gold", name: "Azul y Oro", bgColor: "#010B47", accentColor: "#E0B84F", textColor: "#FFFFFF" },
  { id: "white-blue", name: "Blanco y Azul", bgColor: "#FFFFFF", accentColor: "#025CF3", textColor: "#010B47" },
  { id: "red", name: "Negro y Rojo", bgColor: "#0B0B0B", accentColor: "#E11D48", textColor: "#FFFFFF" },
  { id: "emerald", name: "Verde Esmeralda", bgColor: "#04130E", accentColor: "#34D399", textColor: "#FFFFFF" },
] as const;

export const MAX_CARD_LOGO_CHARS = 400_000;

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido");

export const cardConfigSchema = z.object({
  bgColor: hex,
  accentColor: hex,
  textColor: hex,
  logoUrl: z
    .string()
    .max(MAX_CARD_LOGO_CHARS, "El logo es demasiado pesado")
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Formato de logo no válido")
    .nullable(),
  headline1: z.string().max(40),
  headline2: z.string().max(40),
  services: z
    .array(z.object({ icon: z.enum(CARD_ICON_IDS), label: z.string().max(26) }))
    .max(5),
  qrCodeId: z.string().nullable(),
  showQr: z.boolean(),
  qrCaption: z.string().max(30),
  showNfc: z.boolean(),
  nfcCaption: z.string().max(30),
  qrInverted: z.boolean(), // QR claro sobre fondo oscuro (más vistoso, menos compatible)
  decoration: z.enum(["corners", "frame", "none"]),
});

export type CardConfig = z.infer<typeof cardConfigSchema>;

export const cardPayloadSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  config: cardConfigSchema,
});

export const DEFAULT_CARD_CONFIG: CardConfig = {
  bgColor: "#0B0B0B",
  accentColor: "#D4A94B",
  textColor: "#FFFFFF",
  logoUrl: null,
  headline1: "SÍGUENOS EN NUESTRAS",
  headline2: "REDES SOCIALES",
  services: [
    { icon: "plane", label: "Viajes Privados" },
    { icon: "plane-takeoff", label: "Traslado de Aeropuerto" },
    { icon: "shield", label: "Seguridad" },
    { icon: "car", label: "Traslados" },
    { icon: "message", label: "Mensajería" },
  ],
  qrCodeId: null,
  showQr: true,
  qrCaption: "Acerque Su Cámara",
  showNfc: true,
  nfcCaption: "Acerque Su Celular",
  qrInverted: false,
  decoration: "corners",
};

/** Aclara (amt > 0) u oscurece (amt < 0) un color hexadecimal. */
export function shade(hexColor: string, amt: number): string {
  const n = parseInt(hexColor.replace("#", ""), 16);
  const ch = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Divide un texto en máximo dos líneas equilibradas. */
export function splitTwoLines(text: string, maxPerLine: number): string[] {
  const t = text.trim();
  if (t.length <= maxPerLine) return [t];
  const words = t.split(/\s+/);
  if (words.length === 1) return [t];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}
