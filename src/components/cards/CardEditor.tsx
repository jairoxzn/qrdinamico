"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowLeft, Download, FileText, Printer, Save, ImagePlus, Trash2, Plus, Loader2, AlertTriangle } from "lucide-react";
import CardSvg, { CARD_H, CARD_W } from "./CardSvg";
import {
  CARD_ICONS,
  CARD_THEMES,
  CardConfig,
  DEFAULT_CARD_CONFIG,
  MAX_CARD_LOGO_CHARS,
  shade,
} from "@/lib/card-design";
import { buildQrOptions, fileToLogoDataUrl } from "@/lib/qr-style";
import { getBaseUrl, getDynamicQrUrl } from "@/lib/utils";

interface QrOption {
  id: string;
  title: string;
  shortCode: string;
  dotStyle: string;
  cornerSquareStyle: string;
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#025CF3]/30 focus:border-[#025CF3]";
const labelCls = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5";

export default function CardEditor({ cardId }: { cardId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("Mi tarjeta");
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);
  const [qrs, setQrs] = useState<QrOption[]>([]);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!cardId);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const patch = (p: Partial<CardConfig>) => {
    setSaved(false);
    setConfig((c) => ({ ...c, ...p }));
  };

  // Cargar QRs disponibles y, si se edita, el diseño existente
  useEffect(() => {
    fetch("/api/qrcodes")
      .then((r) => (r.ok ? r.json() : { qrcodes: [] }))
      .then((d) => setQrs(d.qrcodes || []))
      .catch(() => {});
    if (cardId) {
      fetch(`/api/cards/${cardId}`)
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "No se pudo cargar el diseño");
          setName(d.card.name);
          setConfig({ ...DEFAULT_CARD_CONFIG, ...d.card.config });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [cardId]);

  const selectedQr = qrs.find((q) => q.id === config.qrCodeId) || null;

  // Generar la imagen del QR que va dentro de la tarjeta
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      const data = selectedQr ? getDynamicQrUrl(selectedQr.shortCode) : `${getBaseUrl()}/q/ejemplo`;
      const boxFill = shade(config.bgColor, 0.05);
      const opts = buildQrOptions({
        data,
        fgColor: config.qrInverted ? config.textColor : "#0B0B0B",
        bgColor: config.qrInverted ? boxFill : "#FFFFFF",
        dotStyle: selectedQr?.dotStyle,
        cornerSquareStyle: selectedQr?.cornerSquareStyle,
        size: 700,
      });
      const raw = await new QRCodeStyling(opts).getRawData("png");
      if (!raw || cancelled) return;
      const reader = new FileReader();
      reader.onload = () => !cancelled && setQrImage(reader.result as string);
      reader.readAsDataURL(raw as Blob);
    })().catch((e) => console.error("Error al generar QR de la tarjeta:", e));
    return () => {
      cancelled = true;
    };
  }, [selectedQr?.shortCode, selectedQr?.dotStyle, selectedQr?.cornerSquareStyle, config.qrInverted, config.bgColor, config.textColor]);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setError(null);
      patch({ logoUrl: await fileToLogoDataUrl(file, 900, MAX_CARD_LOGO_CHARS) });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateService = (i: number, p: Partial<CardConfig["services"][number]>) =>
    patch({ services: config.services.map((s, k) => (k === i ? { ...s, ...p } : s)) });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(cardId ? `/api/cards/${cardId}` : "/api/cards", {
        method: cardId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setSaved(true);
      if (!cardId) router.replace(`/dashboard/cards/${data.card.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Exportación ----
  const svgString = () => renderToStaticMarkup(<CardSvg config={config} qrImage={qrImage} />).replace(/width="100%"/, `width="${CARD_W}" height="${CARD_H}"`);

  const svgToPngBlob = (scale: number) =>
    new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = CARD_W * scale;
        canvas.height = CARD_H * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo crear la imagen"))), "image/png");
      };
      img.onerror = () => reject(new Error("No se pudo renderizar la tarjeta"));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString())}`;
    });

  const save = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileBase = name.replace(/[^\w-]+/g, "_") || "tarjeta";

  const exportAs = async (kind: "png" | "svg" | "pdf") => {
    setExporting(kind);
    setError(null);
    try {
      if (kind === "svg") {
        save(new Blob([svgString()], { type: "image/svg+xml" }), `${fileBase}.svg`);
      } else if (kind === "png") {
        save(await svgToPngBlob(3), `${fileBase}.png`);
      } else {
        const { jsPDF } = await import("jspdf");
        const png = await svgToPngBlob(3);
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(png);
        });
        const doc = new jsPDF({ unit: "mm", format: [85, 110] });
        doc.addImage(dataUrl, "PNG", 0, 0, 85, 110);
        doc.save(`${fileBase}.pdf`);
      }
    } catch (err: any) {
      setError(err.message || "Error al exportar");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#025CF3] mb-3" />
        Cargando diseño...
      </div>
    );
  }

  const cardLabelTooLight = config.accentColor.toLowerCase() === config.bgColor.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cards" className="p-2 text-slate-500 hover:text-[#010B47] hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#010B47]">{cardId ? "Editar tarjeta" : "Nueva tarjeta"}</h1>
            <p className="text-xs text-slate-500">Diseña la tarjeta con QR y NFC lista para imprimir (85 × 110 mm).</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#025CF3] hover:bg-[#0146BD] text-white text-sm font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Guardado" : "Guardar diseño"}
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controles */}
        <div className="lg:col-span-7 space-y-5">
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-4">
            <div>
              <label className={labelCls}>Nombre del diseño</label>
              <input className={inputCls} value={name} maxLength={80} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
            </div>

            <div>
              <label className={labelCls}>Tema de color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => patch({ bgColor: t.bgColor, accentColor: t.accentColor, textColor: t.textColor })}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 hover:border-[#025CF3] bg-white"
                  >
                    <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${t.bgColor} 50%, ${t.accentColor} 50%)` }} />
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  ["bgColor", "Fondo"],
                  ["accentColor", "Acento"],
                  ["textColor", "Texto"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <span className="text-[11px] text-slate-500">{label}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={config[key]} onChange={(e) => patch({ [key]: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer" />
                      <span className="font-mono text-[11px] uppercase text-slate-600">{config[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
              {cardLabelTooLight && (
                <p className="mt-2 text-[11px] text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> El acento es igual al fondo: no se verá.</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Decoración</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["corners", "Esquinas doradas"],
                  ["frame", "Marco simple"],
                  ["none", "Sin decoración"],
                ] as const).map(([id, label]) => (
                  <button key={id} type="button" onClick={() => patch({ decoration: id })}
                    className={`p-2.5 text-xs rounded-xl border font-medium ${config.decoration === id ? "border-[#025CF3] bg-blue-50 text-[#025CF3] font-bold" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-4">
            <div>
              <label className={labelCls}>Logo de la marca</label>
              <div className="flex items-center gap-3">
                {config.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.logoUrl} alt="Logo" className="w-16 h-12 rounded-lg border border-slate-200 object-contain bg-slate-800" />
                ) : (
                  <div className="w-16 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300"><ImagePlus className="w-5 h-5" /></div>
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700">
                  {config.logoUrl ? "Cambiar logo" : "Subir logo"}
                </button>
                {config.logoUrl && (
                  <button type="button" onClick={() => patch({ logoUrl: null })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl" title="Quitar logo"><Trash2 className="w-4 h-4" /></button>
                )}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="hidden" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">PNG con fondo transparente se ve mejor.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Titular (línea 1)</label>
                <input className={inputCls} value={config.headline1} maxLength={40} onChange={(e) => patch({ headline1: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Titular destacado (línea 2)</label>
                <input className={inputCls} value={config.headline2} maxLength={40} onChange={(e) => patch({ headline2: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Servicios / íconos ({config.services.length}/5)</label>
              <button type="button" disabled={config.services.length >= 5}
                onClick={() => patch({ services: [...config.services, { icon: "star", label: "Servicio" }] })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#025CF3] disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            {config.services.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={s.icon} onChange={(e) => updateService(i, { icon: e.target.value })} className={inputCls + " !w-40"}>
                  {CARD_ICONS.map((ic) => <option key={ic.id} value={ic.id}>{ic.name}</option>)}
                </select>
                <input className={inputCls} value={s.label} maxLength={26} onChange={(e) => updateService(i, { label: e.target.value })} />
                <button type="button" onClick={() => patch({ services: config.services.filter((_, k) => k !== i) })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl" title="Quitar"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {config.services.length === 0 && <p className="text-xs text-slate-400">Sin servicios: la fila de íconos se oculta.</p>}
          </section>

          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <input type="checkbox" checked={config.showQr} onChange={(e) => patch({ showQr: e.target.checked })} /> Mostrar código QR
                </label>
                <input className={inputCls} value={config.qrCaption} maxLength={30} onChange={(e) => patch({ qrCaption: e.target.value })} placeholder="Texto bajo el QR" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <input type="checkbox" checked={config.showNfc} onChange={(e) => patch({ showNfc: e.target.checked })} /> Mostrar zona NFC
                </label>
                <input className={inputCls} value={config.nfcCaption} maxLength={30} onChange={(e) => patch({ nfcCaption: e.target.value })} placeholder="Texto bajo el NFC" />
              </div>
            </div>

            {config.showQr && (
              <div>
                <label className={labelCls}>Código QR dinámico a usar</label>
                <select className={inputCls} value={config.qrCodeId || ""} onChange={(e) => patch({ qrCodeId: e.target.value || null })}>
                  <option value="">— Seleccione un QR (se muestra uno de ejemplo) —</option>
                  {qrs.map((q) => <option key={q.id} value={q.id}>{q.title} · /q/{q.shortCode}</option>)}
                </select>
                {!config.qrCodeId && (
                  <p className="mt-1.5 text-[11px] text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Sin QR seleccionado, el QR de la tarjeta no funcionará al imprimir.</p>
                )}
                <label className="mt-3 flex items-start gap-2 text-xs text-slate-700">
                  <input type="checkbox" className="mt-0.5" checked={config.qrInverted} onChange={(e) => patch({ qrInverted: e.target.checked })} />
                  <span>
                    QR claro sobre fondo oscuro (estilo elegante).
                    <span className="block text-[11px] text-slate-500">Algunos lectores antiguos no lo leen. Por defecto el QR va oscuro sobre blanco, que escanea en todos los celulares.</span>
                  </span>
                </label>
              </div>
            )}
          </section>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-slate-100">
              <CardSvg config={config} qrImage={qrImage} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => exportAs("png")} disabled={!!exporting} className="flex flex-col items-center py-2.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50">
                <Download className="w-4 h-4 mb-1" />{exporting === "png" ? "..." : "PNG HD"}
              </button>
              <button onClick={() => exportAs("svg")} disabled={!!exporting} className="flex flex-col items-center py-2.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50">
                <FileText className="w-4 h-4 mb-1 text-indigo-600" />{exporting === "svg" ? "..." : "SVG"}
              </button>
              <button onClick={() => exportAs("pdf")} disabled={!!exporting} className="flex flex-col items-center py-2.5 text-[11px] font-semibold text-white bg-[#010B47] hover:bg-[#025CF3] rounded-xl disabled:opacity-50">
                <Printer className="w-4 h-4 mb-1" />{exporting === "pdf" ? "..." : "PDF impresión"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center">Tamaño de impresión 85 × 110 mm · PNG a 2550 × 3300 px</p>
          </div>
        </div>
      </div>
    </div>
  );
}
