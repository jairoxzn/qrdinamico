"use client";

import { useState, useEffect } from "react";
import { X, Radio, Loader2, AlertCircle } from "lucide-react";
import { NfcCardItem, QRCodeItem } from "@/lib/types";

interface NfcCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: NfcCardItem | null;
  onSuccess: () => void;
}

export default function NfcCardModal({
  isOpen,
  onClose,
  cardToEdit,
  onSuccess,
}: NfcCardModalProps) {
  const [uid, setUid] = useState("");
  const [label, setLabel] = useState("");
  const [model, setModel] = useState("NTAG215");
  const [batch, setBatch] = useState("");
  const [qrCodeId, setQrCodeId] = useState("");
  const [notes, setNotes] = useState("");

  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch user's QR codes to populate association select
      fetch("/api/qrcodes")
        .then((res) => res.json())
        .then((data) => setQrcodes(data.qrcodes || []))
        .catch((err) => console.error(err));

      if (cardToEdit) {
        setUid(cardToEdit.uid);
        setLabel(cardToEdit.label);
        setModel(cardToEdit.model);
        setBatch(cardToEdit.batch || "");
        setQrCodeId(cardToEdit.qrCodeId || "");
        setNotes(cardToEdit.notes || "");
      } else {
        // Auto-generate random realistic hex UID for demo/testing convenience
        const randomUid = Array.from({ length: 7 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase()
        ).join(":");
        setUid(randomUid);
        setLabel("");
        setModel("NTAG215");
        setBatch("LOTE-" + new Date().getFullYear());
        setQrCodeId("");
        setNotes("");
      }
      setError(null);
    }
  }, [isOpen, cardToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = cardToEdit ? `/api/nfc/${cardToEdit.id}` : "/api/nfc";
      const method = cardToEdit ? "PATCH" : "POST";

      const payload = {
        uid,
        label,
        model,
        batch: batch || null,
        qrCodeId: qrCodeId || null,
        notes: notes || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la tarjeta NFC");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar tarjeta");
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
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {cardToEdit ? "Editar Tarjeta NFC" : "Registrar Nueva Tarjeta NFC"}
              </h2>
              <p className="text-xs text-blue-200">
                Identificador físico y vinculación con código QR dinámico
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              UID Físico del Chip NFC (Hexadecimal) *
            </label>
            <input
              type="text"
              required
              disabled={!!cardToEdit}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="04:A1:B2:C3:D4:E5:F6"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth disabled:opacity-60"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Número de serie único de 7 o 4 bytes grabado de fábrica en el silicio.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Etiqueta o Nombre Amigable *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Tarjeta Metal Black Juan Pérez / Mesa 04 / Llavero Acrílico"
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Modelo de Chip
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              >
                <option value="NTAG213">NTAG213 (144 bytes)</option>
                <option value="NTAG215">NTAG215 (504 bytes - Estándar)</option>
                <option value="NTAG216">NTAG216 (888 bytes)</option>
                <option value="Mifare Classic">Mifare Classic 1K</option>
                <option value="Custom PVC">Tarjeta PVC Personalizada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Lote de Fabricación
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="LOTE-2025-01"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Asociar a Código QR Dinámico
            </label>
            <select
              value={qrCodeId}
              onChange={(e) => setQrCodeId(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
            >
              <option value="">-- Sin Asignar (Tarjeta en inventario) --</option>
              {qrcodes.map((qr) => (
                <option key={qr.id} value={qr.id}>
                  {qr.title} (/q/{qr.shortCode})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Al acercar esta tarjeta física a un smartphone, abrirá el código QR seleccionado.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ubicación física, persona a quien se entregó..."
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
            />
          </div>

          {/* Footer buttons */}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#025CF3] hover:bg-[#0146BD] text-white text-xs font-bold rounded-xl shadow-md transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{cardToEdit ? "Actualizar Tarjeta" : "Registrar Tarjeta"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

