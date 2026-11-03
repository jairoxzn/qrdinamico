"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  Radio,
  ExternalLink,
  Edit2,
  Trash2,
  History,
  BarChart3,
  Power,
  Copy,
  Check,
  Calendar,
  Layers,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import QRCodePreview from "@/components/qr/QRCodePreview";
import DestinationUpdateModal from "@/components/qr/DestinationUpdateModal";
import { QRCodeItem, DestinationHistoryItem } from "@/lib/types";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function QRCodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchQRDetail = async () => {
    try {
      const res = await fetch(`/api/qrcodes/${id}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar el código QR");
      }
      const data = await res.json();
      setQr(data.qr);
    } catch (err: any) {
      setError(err.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQRDetail();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!qr) return;
    const newStatus = qr.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setQr({ ...qr, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar este código QR? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/qrcodes");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyUrl = () => {
    if (!qr) return;
    navigator.clipboard.writeText(`${window.location.origin}/q/${qr.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#025CF3] mb-3" />
        Cargando detalles del código QR...
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Código QR no encontrado
        </h3>
        <p className="text-xs text-slate-500 mb-4">{error || "Elemento inexistente"}</p>
        <Link
          href="/dashboard/qrcodes"
          className="px-4 py-2 bg-[#025CF3] text-white text-xs font-semibold rounded-xl"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/qrcodes"
            className="p-2 text-slate-500 hover:text-[#010B47] hover:bg-slate-100 rounded-xl transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
                {qr.title}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  qr.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {qr.status === "ACTIVE" ? "Activo" : "Suspendido"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Categoría: <span className="font-semibold text-slate-700">{qr.category || "General"}</span> • Creado el {formatDate(qr.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-smooth ${
              qr.status === "ACTIVE"
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{qr.status === "ACTIVE" ? "Pausar Código" : "Activar Código"}</span>
          </button>

          <Link
            href={`/dashboard/qrcodes/${qr.id}/stats`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 text-[#025CF3] border border-blue-200 hover:bg-blue-100 transition-smooth"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Ver Analítica</span>
          </Link>

          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-smooth"
            title="Eliminar QR"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Info & Destination on Left, Preview/Download on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Destination URL card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#010B47] uppercase tracking-wider">
                Destino Dinámico Actual
              </span>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#025CF3] hover:bg-[#0146BD] rounded-xl shadow-sm transition-smooth"
              >
                <Edit2 className="w-3 h-3" />
                <span>Modificar Destino</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 break-all flex items-center justify-between">
              <span>{qr.destinationUrl}</span>
              <a
                href={qr.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-400 hover:text-[#025CF3] ml-2 flex-shrink-0"
                title="Abrir destino"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                  Escaneos Totales
                </span>
                <span className="text-xl font-extrabold text-[#010B47]">
                  {qr.scanCount.toLocaleString("es-CO")}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                  Último Escaneo
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-1">
                  {formatTimeAgo(qr.lastScannedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked NFC Cards card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-[#010B47] uppercase tracking-wider">
                  Tarjetas NFC Físicas Asociadas ({qr.nfcCards?.length || 0})
                </span>
              </div>
              <Link
                href={`/dashboard/nfc`}
                className="text-xs font-bold text-[#025CF3] hover:underline"
              >
                Gestionar Tarjetas
              </Link>
            </div>

            {qr.nfcCards && qr.nfcCards.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {qr.nfcCards.map((card: any) => (
                  <div key={card.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{card.label}</div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        UID: {card.uid} • Chip: {card.model}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      VINCULADA
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-slate-400 text-xs">
                No hay tarjetas NFC asociadas a este código QR.
              </div>
            )}
          </div>

          {/* Destination Modification History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <History className="w-4 h-4 text-[#025CF3]" />
              <span className="text-xs font-bold text-[#010B47] uppercase tracking-wider">
                Historial de Modificaciones de Destino
              </span>
            </div>

            {qr.history && qr.history.length > 0 ? (
              <div className="space-y-3">
                {qr.history.map((hist: DestinationHistoryItem) => (
                  <div
                    key={hist.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Modificado por <strong className="text-slate-700">{hist.changedBy.name}</strong></span>
                      <span>{formatTimeAgo(hist.createdAt)}</span>
                    </div>
                    <div className="font-mono text-[11px] space-y-0.5">
                      <div className="text-slate-400 line-through truncate">
                        Antes: {hist.oldUrl}
                      </div>
                      <div className="text-[#025CF3] font-semibold truncate">
                        Ahora: {hist.newUrl}
                      </div>
                    </div>
                    {hist.reason && (
                      <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                        Motivo: {hist.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No se han registrado modificaciones previas en este enlace.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Visual Preview & Downloads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
            <h3 className="text-xs font-bold text-[#010B47] uppercase tracking-wider mb-4 text-center">
              Código QR Físico & Descargas
            </h3>

            <QRCodePreview
              shortCode={qr.shortCode}
              title={qr.title}
              fgColor={qr.fgColor}
              bgColor={qr.bgColor}
              companyName={qr.user?.company || "JAIROSYSTEN"}
              size={230}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-[#025CF3]">
              <QrCode className="w-4 h-4" />
              <span>Regla Fundamental de Redirección</span>
            </div>
            <p className="leading-relaxed">
              El código QR y el chip NFC almacenan únicamente la URL dinámica{" "}
              <strong className="font-mono">/q/{qr.shortCode}</strong>. El destino final nunca se codifica en el chip físico, garantizando flexibilidad total.
            </p>
          </div>
        </div>
      </div>

      {/* Destination Update Modal */}
      <DestinationUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        qrId={qr.id}
        qrTitle={qr.title}
        shortCode={qr.shortCode}
        currentDestinationUrl={qr.destinationUrl}
        onSuccess={(newUrl) => {
          setQr((prev: any) => ({ ...prev, destinationUrl: newUrl }));
          fetchQRDetail();
        }}
      />
    </div>
  );
}

