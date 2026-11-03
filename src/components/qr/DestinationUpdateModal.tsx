"use client";

import { useState } from "react";
import { X, Globe, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface DestinationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrId: string;
  qrTitle: string;
  shortCode: string;
  currentDestinationUrl: string;
  onSuccess: (newUrl: string) => void;
}

export default function DestinationUpdateModal({
  isOpen,
  onClose,
  qrId,
  qrTitle,
  shortCode,
  currentDestinationUrl,
  onSuccess,
}: DestinationUpdateModalProps) {
  const [newUrl, setNewUrl] = useState(currentDestinationUrl);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/qrcodes/${qrId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl: newUrl,
          changeReason: reason || "Actualización de URL destino desde panel",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar el destino");
      }

      onSuccess(newUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el nuevo destino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-dropdown overflow-hidden">
        {/* Header */}
        <div className="bg-[#010B47] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#025CF3] flex items-center justify-center shadow-glow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Modificar Destino Dinámico</h2>
              <p className="text-xs text-blue-200">
                Cambio inmediato en caliente sin alterar el QR físico ni el chip NFC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <div className="font-semibold text-slate-800">{qrTitle}</div>
            <div className="font-mono text-[#025CF3]">
              Identificador permanente: <span className="font-bold">/q/{shortCode}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nueva URL de Destino (HTTP / HTTPS)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://ejemplo.com/nueva-pagina"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth font-mono"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Al escanear el QR o acercar la tarjeta NFC, el usuario será transferido a esta URL.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo de la Modificación (Historial de Auditoría)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Cambio de campaña de temporada / Actualización de menú"
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#025CF3] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Sincronización Inmediata</span>
              El nuevo destino se reflejará instantáneamente en el siguiente escaneo sin demoras de caché.
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-smooth"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#025CF3] hover:bg-[#0146BD] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-glow transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Neon DB...</span>
                </>
              ) : (
                <>
                  <span>Actualizar Destino</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

