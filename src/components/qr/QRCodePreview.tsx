"use client";

import { useEffect, useState, useRef } from "react";
import QRCodeLib from "qrcode";
import { Download, FileText, ExternalLink, Copy, Check, Printer } from "lucide-react";
import { generatePrintablePdf, QROptions } from "@/lib/qr-generator";
import { getDynamicQrUrl } from "@/lib/utils";

interface QRCodePreviewProps {
  shortCode: string;
  title: string;
  fgColor?: string;
  bgColor?: string;
  dotStyle?: string;
  cornerSquareStyle?: string;
  companyName?: string;
  size?: number;
}

export default function QRCodePreview({
  shortCode,
  title,
  fgColor = "#010B47",
  bgColor = "#FFFFFF",
  companyName = "XhionSoft Technologies",
  size = 240,
}: QRCodePreviewProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dynamicUrl = getDynamicQrUrl(shortCode);

  useEffect(() => {
    QRCodeLib.toDataURL(dynamicUrl, {
      width: size * 2,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error("Error al generar imagen de código QR:", err);
      });
  }, [dynamicUrl, fgColor, bgColor, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR_${shortCode}_xhionsoft.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCodeLib.toString(dynamicUrl, {
        type: "svg",
        color: { dark: fgColor, light: bgColor },
        margin: 2,
        errorCorrectionLevel: "H",
      });
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${shortCode}_vector.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar SVG:", err);
    }
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const doc = await generatePrintablePdf(
        { shortCode, fgColor, bgColor },
        title,
        companyName
      );
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
        className="p-4 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center transition-smooth"
        style={{ backgroundColor: bgColor }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code ${shortCode}`}
            style={{ width: size, height: size }}
            className="rounded-lg object-contain"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs animate-pulse"
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

