"use client";

import { useRef, useState } from "react";
import { Palette, ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import { CORNER_STYLES, DOT_STYLES, contrastWarning, fileToLogoDataUrl } from "@/lib/qr-style";

interface QRCodeCustomizerProps {
  fgColor: string;
  setFgColor: (c: string) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  dotStyle: string;
  setDotStyle: (s: string) => void;
  cornerSquareStyle: string;
  setCornerSquareStyle: (s: string) => void;
  logoUrl?: string | null;
  setLogoUrl?: (u: string | null) => void;
}

const FG_PRESETS = [
  { name: "Azul JAIROSYSTEN", hex: "#010B47" },
  { name: "Azul Eléctrico", hex: "#025CF3" },
  { name: "Negro Puro", hex: "#000000" },
  { name: "Gris Grafito", hex: "#1E293B" },
  { name: "Esmeralda", hex: "#065F46" },
  { name: "Vino Corporativo", hex: "#881337" },
];

const BG_PRESETS = [
  { name: "Blanco Puro", hex: "#FFFFFF" },
  { name: "Gris Suave", hex: "#F8FAFC" },
  { name: "Hielo Sutil", hex: "#F1F5F9" },
  { name: "Crema Suave", hex: "#FFFBEB" },
];

export default function QRCodeCustomizer({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  dotStyle,
  setDotStyle,
  cornerSquareStyle,
  setCornerSquareStyle,
  logoUrl = null,
  setLogoUrl,
}: QRCodeCustomizerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const warning = contrastWarning(fgColor, bgColor);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !setLogoUrl) return;
    try {
      setLogoError(null);
      setLogoUrl(await fileToLogoDataUrl(file));
    } catch (err: any) {
      setLogoError(err.message || "No se pudo cargar el logo");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Palette className="w-4 h-4 text-[#025CF3]" />
        <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
          Personalización Visual del Código QR
        </h3>
      </div>

      {/* Foreground Color */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Color de los Puntos / Módulos (Foreground)
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {FG_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => setFgColor(preset.hex)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition-smooth ${
                fgColor.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-[#025CF3] bg-blue-50/60 font-bold shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: preset.hex }}
              />
              <span className="text-slate-700">{preset.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
          />
          <input
            type="text"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="font-mono text-xs uppercase px-2 py-1.5 border border-slate-300 rounded-lg w-28 bg-slate-50"
          />
        </div>
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Color de Fondo (Background)
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => setBgColor(preset.hex)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition-smooth ${
                bgColor.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-[#025CF3] bg-blue-50/60 font-bold shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: preset.hex }}
              />
              <span className="text-slate-700">{preset.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="font-mono text-xs uppercase px-2 py-1.5 border border-slate-300 rounded-lg w-28 bg-slate-50"
          />
        </div>
      </div>

      {/* Module Pattern Style */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Estilo de Patrón (Matriz de Datos)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setDotStyle(style.id)}
              className={`p-2.5 text-xs text-center rounded-xl border transition-smooth font-medium ${
                dotStyle === style.id
                  ? "border-[#025CF3] bg-blue-50 text-[#025CF3] font-bold"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Corner Square Style */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Esquinas de Enfoque (Ojos QR)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CORNER_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setCornerSquareStyle(style.id)}
              className={`p-2.5 text-xs text-center rounded-xl border transition-smooth font-medium ${
                cornerSquareStyle === style.id
                  ? "border-[#025CF3] bg-blue-50 text-[#025CF3] font-bold"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>
      {warning && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {setLogoUrl && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Logo en el Centro
          </label>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-lg border border-slate-200 object-contain bg-white" />
            ) : (
              <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <ImagePlus className="w-5 h-5" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700"
            >
              {logoUrl ? "Cambiar logo" : "Subir logo"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                title="Quitar logo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="hidden" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            PNG, JPG o WEBP. Se ajusta automáticamente; mejor con fondo transparente y forma simple.
          </p>
          {logoError && <p className="text-[11px] text-rose-600 mt-1">{logoError}</p>}
        </div>
      )}
    </div>
  );
}

