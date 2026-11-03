"use client";

import { useState, useEffect } from "react";
import { Radio, X, ExternalLink, CheckCircle2, Smartphone, AlertCircle, ArrowRight } from "lucide-react";
import { NfcCardItem } from "@/lib/types";

interface NfcTapSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NfcTapSimulatorModal({
  isOpen,
  onClose,
}: NfcTapSimulatorModalProps) {
  const [cards, setCards] = useState<NfcCardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tapStatus, setTapStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCards();
    }
  }, [isOpen]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nfc");
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
        if (data.cards.length > 0 && !selectedCardId) {
          setSelectedCardId(data.cards[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const shortCode = selectedCard?.qrCode?.shortCode;
  const destinationUrl = selectedCard?.qrCode?.destinationUrl;
  const isAssigned = selectedCard?.status === "ASSIGNED" && shortCode;

  const handleSimulateTap = () => {
    if (!shortCode) return;
    const dynamicUrl = `/q/${shortCode}?src=nfc`;
    setTapStatus("¡Tarjeta detectada por el lector NFC! Redirigiendo...");
    setTimeout(() => {
      window.open(dynamicUrl, "_blank");
      setTapStatus(null);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-dropdown overflow-hidden">
        {/* Header */}
        <div className="bg-[#010B47] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#025CF3] flex items-center justify-center shadow-glow">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold">Simulador de Lectura NFC Físico</h2>
              <p className="text-xs text-blue-200">
                Emulador de aproximación a smartphone Android / iOS
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

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Seleccionar Tarjeta / Tag NFC Registrado
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#025CF3] focus:outline-none"
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.label} — UID: {card.uid} ({card.model})
                </option>
              ))}
            </select>
          </div>

          {selectedCard ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Identificador de Fábrica (UID)
                </span>
                <span className="font-mono text-xs font-bold text-[#010B47] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedCard.uid}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Chip Microcontrolador
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedCard.model} (NDEF Tipo 2)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Estado del Vínculo
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isAssigned
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isAssigned ? "ASOCIADA A CÓDIGO QR" : "SIN ASIGNAR"}
                </span>
              </div>

              {isAssigned && (
                <>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      URL Permanente grabada en Chip NFC (NDEF Record)
                    </span>
                    <div className="font-mono text-xs text-[#025CF3] bg-blue-50/70 p-2 rounded-lg break-all border border-blue-200">
                      {window.location.origin}/q/{shortCode}?src=nfc
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Destino Dinámico Actual (en Neon PostgreSQL)
                    </span>
                    <div className="text-xs text-slate-700 bg-white p-2 rounded-lg break-all border border-slate-200 flex items-center justify-between">
                      <span className="truncate">{destinationUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
              No hay tarjetas NFC disponibles para simular.
            </div>
          )}

          {tapStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-bounce" />
              <span>{tapStatus}</span>
            </div>
          )}

          {!isAssigned && selectedCard && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Esta tarjeta no tiene un QR asociado aún. Asocie un código QR en el módulo de Tarjetas NFC.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-smooth"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={!isAssigned}
            onClick={handleSimulateTap}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#025CF3] hover:bg-[#0146BD] text-white text-xs font-bold rounded-xl shadow-md transition-smooth disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4" />
            <span>Simular Toque NFC (Tap)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

