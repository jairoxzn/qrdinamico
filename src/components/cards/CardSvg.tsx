import { Wifi } from "lucide-react";
import { CARD_ICONS, CardConfig, shade, splitTwoLines } from "@/lib/card-design";

export const CARD_W = 850;
export const CARD_H = 1100;

const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

interface CardSvgProps {
  config: CardConfig;
  qrImage?: string | null;
}

/** Ajusta el tamaño de fuente para que el texto quepa en `maxWidth`. */
function fit(text: string, base: number, maxWidth: number, factor = 0.62) {
  const w = text.length * base * factor;
  return w > maxWidth ? Math.floor((maxWidth / (text.length * factor)) * 10) / 10 : base;
}

function Corner({ transform, id }: { transform: string; id: string }) {
  return (
    <g transform={`${transform} scale(0.8)`}>
      <polygon points="0,70 70,0 118,0 0,118" fill={`url(#${id})`} />
      <polygon points="0,140 140,0 164,0 0,164" fill={`url(#${id})`} opacity="0.85" />
      <polygon points="0,182 182,0 194,0 0,194" fill={`url(#${id})`} opacity="0.6" />
    </g>
  );
}

export default function CardSvg({ config, qrImage }: CardSvgProps) {
  const c = config;
  const light = shade(c.accentColor, 0.35);
  const dark = shade(c.accentColor, -0.3);
  const isDarkBg = parseInt(c.bgColor.slice(1), 16) < 0x808080;

  const boxes: ("qr" | "nfc")[] = [];
  if (c.showQr) boxes.push("qr");
  if (c.showNfc) boxes.push("nfc");
  const boxW = 330;
  const gap = 50;
  const totalW = boxes.length * boxW + (boxes.length - 1) * gap;
  const startX = (CARD_W - totalW) / 2;
  const boxY = 650;
  const boxH = 300;

  const n = c.services.length;
  const rowW = 720;
  const slot = n > 0 ? rowW / n : 0;
  const rowX = (CARD_W - rowW) / 2;

  const h1 = c.headline1.trim();
  const h2 = c.headline2.trim();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      width="100%"
      style={{ display: "block", fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={c.accentColor} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id="bgGlow" cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor={shade(c.bgColor, isDarkBg ? 0.1 : -0.04)} />
          <stop offset="1" stopColor={c.bgColor} />
        </radialGradient>
      </defs>

      <rect width={CARD_W} height={CARD_H} fill="url(#bgGlow)" />

      {c.decoration === "frame" && (
        <rect x="36" y="36" width={CARD_W - 72} height={CARD_H - 72} rx="22" fill="none" stroke="url(#gold)" strokeWidth="4" />
      )}
      {c.decoration === "corners" && (
        <>
          <rect x="34" y="34" width={CARD_W - 68} height={CARD_H - 68} rx="18" fill="none" stroke="url(#gold)" strokeWidth="2.5" opacity="0.8" />
          <Corner id="gold" transform="translate(0,0)" />
          <Corner id="gold" transform={`translate(${CARD_W},0) scale(-1,1)`} />
          <Corner id="gold" transform={`translate(0,${CARD_H}) scale(1,-1)`} />
          <Corner id="gold" transform={`translate(${CARD_W},${CARD_H}) scale(-1,-1)`} />
        </>
      )}

      {/* Logo */}
      {c.logoUrl && (
        <image href={c.logoUrl} x="175" y="70" width="500" height="250" preserveAspectRatio="xMidYMid meet" />
      )}

      {/* Titular */}
      {h1 && (
        <text x={CARD_W / 2} y="388" textAnchor="middle" fontWeight="800" fontSize={fit(h1, 56, 700)} fill={c.textColor}>
          {h1}
        </text>
      )}
      {h2 && (
        <text x={CARD_W / 2} y="452" textAnchor="middle" fontWeight="800" fontSize={fit(h2, 60, 700)} fill="url(#gold)">
          {h2}
        </text>
      )}

      {/* Servicios */}
      {c.services.map((s, i) => {
        const cx = rowX + slot * i + slot / 2;
        const Icon = CARD_ICONS.find((x) => x.id === s.icon)?.Icon;
        const lines = splitTwoLines(s.label, 11);
        const fs = Math.min(18, (slot - 14) / (Math.max(...lines.map((l) => l.length), 1) * 0.58));
        return (
          <g key={i}>
            {i > 0 && (
              <line x1={rowX + slot * i} y1="490" x2={rowX + slot * i} y2="610" stroke={c.accentColor} strokeOpacity="0.45" strokeWidth="1.5" />
            )}
            <circle cx={cx} cy="528" r="40" fill="none" stroke="url(#gold)" strokeWidth="3.5" />
            {Icon && <Icon x={cx - 21} y={507} size={42} color={c.accentColor} strokeWidth={1.9} />}
            {lines.map((l, k) => (
              <text key={k} x={cx} y={602 + k * (fs + 3)} textAnchor="middle" fontSize={fs} fontWeight="600" fill={c.textColor}>
                {l.toUpperCase()}
              </text>
            ))}
          </g>
        );
      })}

      {/* Cajas QR / NFC */}
      {boxes.map((kind, i) => {
        const x = startX + i * (boxW + gap);
        const cx = x + boxW / 2;
        const caption = kind === "qr" ? c.qrCaption : c.nfcCaption;
        const capLines = splitTwoLines(caption, 12);
        return (
          <g key={kind}>
            <rect x={x} y={boxY} width={boxW} height={boxH} rx="34" fill={shade(c.bgColor, isDarkBg ? 0.05 : -0.03)} stroke="url(#gold)" strokeWidth="4" />
            {kind === "qr" ? (
              qrImage ? (
                <image href={qrImage} x={x + 35} y={boxY + 25} width="260" height="250" preserveAspectRatio="xMidYMid meet" />
              ) : (
                <text x={cx} y={boxY + boxH / 2} textAnchor="middle" fontSize="22" fill={c.textColor} opacity="0.6">
                  Generando QR...
                </text>
              )
            ) : (
              <>
                <Wifi x={cx - 70} y={boxY + 30} size={140} color={c.textColor} strokeWidth={2.4} />
                <text x={cx} y={boxY + 252} textAnchor="middle" fontSize="60" fontWeight="800" fill={c.textColor}>
                  NFC
                </text>
              </>
            )}
            {capLines.map((l, k) => (
              <text key={k} x={cx} y={boxY + boxH + 62 + k * 44} textAnchor="middle" fontSize="38" fontWeight="700" fill="url(#gold)">
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
