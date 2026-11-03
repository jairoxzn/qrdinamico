"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radio,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Smartphone,
  ExternalLink,
  QrCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Unlink,
} from "lucide-react";
import NfcCardModal from "@/components/nfc/NfcCardModal";
import NfcTapSimulatorModal from "@/components/nfc/NfcTapSimulatorModal";
import { NfcCardItem } from "@/lib/types";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function NfcCardsPage() {
  const [cards, setCards] = useState<NfcCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<NfcCardItem | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const fetchCards = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/nfc?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [search, statusFilter]);

  const handleEdit = (card: NfcCardItem) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setCardToEdit(null);
    setIsModalOpen(true);
  };

  const handleUnlink = async (card: NfcCardItem) => {
    if (!confirm(`¿Desvincular el código QR de la tarjeta "${card.label}"?`)) return;

    try {
      const res = await fetch(`/api/nfc/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId: null }),
      });
      if (res.ok) {
        fetchCards();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (card: NfcCardItem) => {
    if (!confirm(`¿Eliminar definitivamente el registro de la tarjeta "${card.label}"?`)) return;

    try {
      const res = await fetch(`/api/nfc/${card.id}`, { method: "DELETE" });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== card.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
            Gestión de Tarjetas y Tags NFC
          </h2>
          <p className="text-sm text-slate-500">
            Inventario físico de chips NTAG213/215/216 asociados a URLs dinámicas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-smooth"
          >
            <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Simulador de Lectura NFC</span>
          </button>

          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#025CF3] text-white hover:bg-[#0146BD] shadow-md hover:shadow-glow transition-smooth"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Tarjeta NFC</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por UID, etiqueta o modelo..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold uppercase">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
          >
            <option value="ALL">Todas las Tarjetas</option>
            <option value="ASSIGNED">Asociadas a un QR</option>
            <option value="UNASSIGNED">Sin Asignar (Inventario)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#025CF3] mb-2" />
            Cargando inventario de tarjetas NFC...
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              No hay tarjetas NFC registradas
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Agregue chips NTAG o etiquetas físicas para vincularlas a sus códigos QR dinámicos.
            </p>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-[#025CF3] text-white text-xs font-semibold rounded-xl"
            >
              Registrar Primera Tarjeta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Tarjeta y UID Físico</th>
                  <th className="py-3 px-4">Chip y Lote</th>
                  <th className="py-3 px-4">Código QR Asociado</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Último Tap</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50/70 transition-smooth">
                    {/* Label and UID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#010B47] text-sm">{card.label}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {card.uid}
                        </span>
                      </div>
                    </td>

                    {/* Chip Model & Batch */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{card.model}</div>
                      <div className="text-[11px] text-slate-400">{card.batch || "Sin lote"}</div>
                    </td>

                    {/* Linked QR Code */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      {card.qrCode ? (
                        <div className="bg-blue-50/70 border border-blue-200/80 p-2 rounded-xl">
                          <Link
                            href={`/dashboard/qrcodes/${card.qrCode.id}`}
                            className="font-bold text-[#010B47] hover:text-[#025CF3] flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#025CF3]" />
                            <span className="truncate">{card.qrCode.title}</span>
                          </Link>
                          <div className="font-mono text-[10px] text-[#025CF3] truncate mt-0.5">
                            /q/{card.qrCode.shortCode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Sin vincular a ningún QR
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          card.status === "ASSIGNED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {card.status === "ASSIGNED" ? "Asociada" : "En Inventario"}
                      </span>
                    </td>

                    {/* Last Tapped At */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {formatTimeAgo(card.lastTappedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {card.qrCode && (
                          <button
                            onClick={() => handleUnlink(card)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-smooth"
                            title="Desvincular de este código QR"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(card)}
                          className="p-1.5 text-slate-500 hover:text-[#025CF3] hover:bg-blue-50 rounded-lg transition-smooth"
                          title="Editar tarjeta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(card)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-smooth"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NFC Guide Banner */}
      <div className="bg-[#010B47] text-white rounded-2xl p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#025CF3]">
            <Radio className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">
              ¿Cómo programar físicamente las tarjetas NFC?
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Utilice la aplicación móvil <strong>NFC Tools</strong> (iOS / Android) o un codificador USB ACR122U. 
            Escriba un registro <strong>NDEF URL</strong> con el formato <span className="font-mono text-blue-300">https://dominio.com/q/[código]?src=nfc</span>.
            Una vez grabada la tarjeta física, ¡nunca más necesitará reprogramarla!
          </p>
        </div>

        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#025CF3] hover:bg-[#0146BD] text-white text-xs font-bold transition-smooth flex-shrink-0"
        >
          Abrir Simulador NFC
        </button>
      </div>

      {/* Modals */}
      <NfcCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardToEdit={cardToEdit}
        onSuccess={fetchCards}
      />

      <NfcTapSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}

