"use client";

import { Palette, Layers, Sparkles } from "lucide-react";

interface QRCodeCustomizerProps {
  fgColor: string;
  setFgColor: (c: string) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  dotStyle: string;
  setDotStyle: (s: string) => void;
  cornerSquareStyle: string;
  setCornerSquareStyle: (s: string) => void;
}

const FG_PRESETS = [
  { name: "Azul XhionSoft", hex: "#010B47" },
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
}: QRCodeCustomizerProps) {
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
          {[
            { id: "square", name: "Cuadrado Clásico" },
            { id: "rounded", name: "Bordes Redondeados" },
            { id: "dots", name: "Puntos Suaves" },
          ].map((style) => (
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
          {[
            { id: "square", name: "Cuadrado" },
            { id: "rounded", name: "Redondeado" },
            { id: "extra-rounded", name: "Circular" },
          ].map((style) => (
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
    </div>
  );
}

