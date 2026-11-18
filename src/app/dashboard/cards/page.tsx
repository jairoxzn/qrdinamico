"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import CardSvg from "@/components/cards/CardSvg";
import { DEFAULT_CARD_CONFIG, CardConfig } from "@/lib/card-design";
import { formatTimeAgo } from "@/lib/utils";

interface CardRow {
  id: string;
  name: string;
  config: CardConfig;
  updatedAt: string;
  qrCode?: { title: string; shortCode: string } | null;
  user?: { name: string; company?: string | null };
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/cards");
      if (res.ok) setCards((await res.json()).cards || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este diseño de tarjeta?")) return;
    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
    if (res.ok) setCards((c) => c.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#010B47] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#025CF3]" /> Diseñador de Tarjetas
          </h1>
          <p className="text-xs text-slate-500 mt-1">Crea tarjetas listas para imprimir con tu marca, QR dinámico y zona NFC.</p>
        </div>
        <Link href="/dashboard/cards/new" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#025CF3] hover:bg-[#0146BD] text-white text-sm font-bold">
          <Plus className="w-4 h-4" /> Nueva tarjeta
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#025CF3]" /></div>
      ) : cards.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Aún no tienes diseños de tarjeta</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Empieza con la plantilla negro y oro.</p>
          <Link href="/dashboard/cards/new" className="inline-block px-4 py-2 rounded-xl bg-[#025CF3] text-white text-xs font-bold">Crear la primera</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden flex flex-col">
              <Link href={`/dashboard/cards/${c.id}`} className="block bg-slate-100">
                <CardSvg config={{ ...DEFAULT_CARD_CONFIG, ...c.config }} qrImage={null} />
              </Link>
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#010B47] truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {c.qrCode ? `/q/${c.qrCode.shortCode}` : "Sin QR asignado"} · {formatTimeAgo(c.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link href={`/dashboard/cards/${c.id}`} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Editar"><Pencil className="w-4 h-4" /></Link>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
