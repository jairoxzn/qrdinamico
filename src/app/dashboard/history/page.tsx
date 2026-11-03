"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  QrCode,
  ArrowRight,
  User,
  Clock,
  Search,
  ExternalLink,
  Loader2,
  Calendar,
} from "lucide-react";
import { DestinationHistoryItem } from "@/lib/types";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<DestinationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.qrCode?.title && item.qrCode.title.toLowerCase().includes(q)) ||
      (item.qrCode?.shortCode && item.qrCode.shortCode.toLowerCase().includes(q)) ||
      item.oldUrl.toLowerCase().includes(q) ||
      item.newUrl.toLowerCase().includes(q) ||
      (item.reason && item.reason.toLowerCase().includes(q)) ||
      (item.changedBy?.name && item.changedBy.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
          Historial de Modificaciones de Destino
        </h2>
        <p className="text-sm text-slate-500">
          Pista de auditoría completa de cambios de URLs, motivos y usuarios responsables
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código QR, URL o usuario..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#025CF3] mb-2" />
            Cargando historial de auditoría...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No se han registrado modificaciones de destino con los criterios actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Código QR</th>
                  <th className="py-3 px-4">Destino Anterior vs Nuevo</th>
                  <th className="py-3 px-4">Motivo del Cambio</th>
                  <th className="py-3 px-4">Modificado Por</th>
                  <th className="py-3 px-4 text-right">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-smooth">
                    {/* QR Code info */}
                    <td className="py-3.5 px-4">
                      {item.qrCode ? (
                        <Link
                          href={`/dashboard/qrcodes/${item.qrCode.id}`}
                          className="font-bold text-[#010B47] hover:text-[#025CF3] block"
                        >
                          {item.qrCode.title}
                          <span className="block font-mono text-[11px] text-[#025CF3]">
                            /q/{item.qrCode.shortCode}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">Código eliminado</span>
                      )}
                    </td>

                    {/* URLs transition */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="text-slate-400 line-through truncate" title={item.oldUrl}>
                          {item.oldUrl}
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold truncate" title={item.newUrl}>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{item.newUrl}</span>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="text-slate-700 block truncate" title={item.reason || ""}>
                        {item.reason || "Sin motivo especificado"}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {item.changedBy?.name || "Usuario"}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.changedBy?.role || "CLIENT"}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      <div className="font-medium">{formatDate(item.createdAt)}</div>
                      <div className="text-[10px] text-slate-400">{formatTimeAgo(item.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

