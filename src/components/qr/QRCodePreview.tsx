"use client";

import { useEffect, useState, useRef } from "react";
import { Download, FileText, ExternalLink, Copy, Check, Printer } from "lucide-react";
import { generatePrintablePdf } from "@/lib/qr-generator";
import { buildQrOptions } from "@/lib/qr-style";
import { getDynamicQrUrl } from "@/lib/utils";

interface QRCodePreviewProps {
  shortCode: string;
  title: string;
  fgColor?: string;
  bgColor?: string;
  dotStyle?: string;
  cornerSquareStyle?: string;
  logoUrl?: string | null;
  companyName?: string;
  size?: number;
}

export default function QRCodePreview({
  shortCode,
  title,
  fgColor = "#010B47",
  bgColor = "#FFFFFF",
  dotStyle = "square",
  cornerSquareStyle = "square",
  logoUrl = null,
  companyName = "JAIROSYSTEN",
  size = 240,
}: QRCodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<any>(null);

  const dynamicUrl = getDynamicQrUrl(shortCode);

  const optionsFor = (px: number) =>
    buildQrOptions({ data: dynamicUrl, fgColor, bgColor, dotStyle, cornerSquareStyle, logoUrl, size: px });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled || !containerRef.current) return;
      const opts = optionsFor(size * 2);
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling(opts);
        containerRef.current.innerHTML = "";
        qrRef.current.append(containerRef.current);
      } else {
        qrRef.current.update(opts);
      }
      // La vista previa se dibuja al doble de resolución y se reduce por CSS
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
      }
      setReady(true);
    })().catch((err) => console.error("Error al generar código QR:", err));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicUrl, fgColor, bgColor, dotStyle, cornerSquareStyle, logoUrl, size]);

  // Genera una copia a tamaño completo (independiente de la vista previa) para exportar
  const exportRaw = async (extension: "png" | "svg", px: number): Promise<Blob> => {
    const { default: QRCodeStyling } = await import("qr-code-styling");
    const opts = optionsFor(px);
    if (extension === "svg") opts.type = "svg";
    const qr = new QRCodeStyling(opts);
    const raw = await qr.getRawData(extension);
    if (!raw) throw new Error("No se pudo generar el archivo");
    return raw as Blob;
  };

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    try {
      saveBlob(await exportRaw("png", 1200), `QR_${shortCode}_jairosysten.png`);
    } catch (err) {
      console.error("Error al descargar PNG:", err);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      saveBlob(await exportRaw("svg", 1000), `QR_${shortCode}_vector.svg`);
    } catch (err) {
      console.error("Error al descargar SVG:", err);
    }
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const blob = await exportRaw("png", 1000);
      const qrDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const doc = await generatePrintablePdf({ shortCode, fgColor, bgColor }, title, companyName, qrDataUrl);
      doc.save(`Ficha_NFC_QR_${shortCode}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-soft w-full">
      {/* Visual QR Container */}
      <div
        className="relative p-4 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center transition-smooth"
        style={{ backgroundColor: bgColor }}
      >
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
          className="rounded-lg overflow-hidden flex items-center justify-center"
        />
        {!ready && (
          <div
            style={{ width: size, height: size }}
            className="absolute bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs animate-pulse"
          >
            Generando QR...
          </div>
        )}
      </div>

      {/* Dynamic short code pill */}
      <div className="mt-4 w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
        <div className="truncate pr-2">
          <span className="text-slate-400 font-mono">/q/</span>
          <span className="font-mono font-bold text-[#010B47]">{shortCode}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-smooth"
            title="Copiar URL dinámica"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={dynamicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-blue-50 text-[#025CF3] rounded-lg transition-smooth"
            title="Probar redirección"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-full">
        <button
          onClick={handleDownloadPng}
          className="flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-smooth"
        >
          <Download className="w-3.5 h-3.5 mb-1 text-slate-600" />
          <span>PNG HD</span>
        </button>

        <button
          onClick={handleDownloadSvg}
          className="flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-smooth"
        >
          <FileText className="w-3.5 h-3.5 mb-1 text-indigo-600" />
          <span>Vector SVG</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={generatingPdf}
          className="flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold text-white bg-[#010B47] hover:bg-[#025CF3] rounded-xl shadow-sm transition-smooth disabled:opacity-50"
        >
          <Printer className="w-3.5 h-3.5 mb-1" />
          <span>{generatingPdf ? "..." : "PDF Ficha"}</span>
        </button>
      </div>
    </div>
  );
}
