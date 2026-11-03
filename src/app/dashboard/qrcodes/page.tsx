"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Radio,
  BarChart2,
  Power,
  Copy,
  Check,
  Globe,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import DestinationUpdateModal from "@/components/qr/DestinationUpdateModal";
import { QRCodeItem } from "@/lib/types";

export default function QRCodesPage() {
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal de actualización rápida de destino
  const [activeModalQr, setActiveModalQr] = useState<QRCodeItem | null>(null);

  const fetchQRCodes = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/qrcodes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQrcodes(data.qrcodes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, [search, statusFilter]);

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/q/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (qr: QRCodeItem) => {
    const newStatus = qr.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setQrcodes((prev) =>
          prev.map((item) => (item.id === qr.id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const handleDelete = async (qr: QRCodeItem) => {
    if (!confirm(`¿Está seguro de eliminar el código QR "${qr.title}"? Esta acción desvinculará las tarjetas NFC asociadas.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, { method: "DELETE" });
      if (res.ok) {
        setQrcodes((prev) => prev.filter((item) => item.id !== qr.id));
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
            Gestión de Códigos QR Dinámicos
          </h2>
          <p className="text-sm text-slate-500">
            Administre URLs de destino, personalización gráfica y asociaciones NFC
          </p>
        </div>

        <Link
          href="/dashboard/qrcodes/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#025CF3] text-white hover:bg-[#0146BD] shadow-md hover:shadow-glow transition-smooth self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Nuevo Código QR</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, shortcode o URL..."
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
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="SUSPENDED">Pausados / Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#025CF3] mb-2" />
            Cargando catálogo de códigos QR...
          </div>
        ) : qrcodes.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              No se encontraron códigos QR
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Cree su primer código dinámico con URL única o modifique los filtros de búsqueda.
            </p>
            <Link
              href="/dashboard/qrcodes/new"
              className="px-4 py-2 bg-[#025CF3] text-white text-xs font-semibold rounded-xl hover:bg-[#0146BD]"
            >
              Crear Código QR
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Código e Identificador</th>
                  <th className="py-3 px-4">Destino Dinámico</th>
                  <th className="py-3 px-4 text-center">NFCs Asociadas</th>
                  <th className="py-3 px-4 text-center">Escaneos</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qrcodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50/70 transition-smooth">
                    {/* Title & ShortCode */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 border border-slate-200 flex-shrink-0"
                          style={{ backgroundColor: qr.bgColor }}
                        >
                          <QrCode className="w-full h-full" style={{ color: qr.fgColor }} />
                        </div>
                        <div>
                          <div className="font-bold text-[#010B47] text-sm flex items-center gap-2">
                            <span>{qr.title}</span>
                            {qr.category && (
                              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {qr.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-semibold text-[#025CF3] bg-blue-50 px-1.5 py-0.5 rounded">
                              /q/{qr.shortCode}
                            </span>
                            <button
                              onClick={() => handleCopy(qr.shortCode)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copiar URL"
                            >
                              {copiedCode === qr.shortCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Destination URL with 1-click update trigger */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="flex items-center justify-between group bg-slate-50/80 p-2 rounded-xl border border-slate-200">
                        <span
                          className="truncate text-slate-700 font-mono text-[11px] pr-2"
                          title={qr.destinationUrl}
                        >
                          {qr.destinationUrl}
                        </span>
                        <button
                          onClick={() => setActiveModalQr(qr)}
                          className="text-[#025CF3] hover:text-[#0146BD] text-[11px] font-bold px-2 py-1 rounded bg-blue-100/60 hover:bg-blue-100 transition-smooth flex-shrink-0"
                          title="Cambiar URL de destino ahora"
                        >
                          Cambiar
                        </button>
                      </div>
                    </td>

                    {/* Associated NFC tags */}
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/nfc?qrId=${qr.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-smooth"
                        title="Ver o asociar tarjetas NFC a este QR"
                      >
                        <Radio className="w-3 h-3 text-indigo-600" />
                        <span>{qr.nfcCards?.length || 0}</span>
                      </Link>
                    </td>

                    {/* Total Scans */}
                    <td className="py-3.5 px-4 text-center font-extrabold text-[#010B47] text-sm">
                      {qr.scanCount.toLocaleString("es-CO")}
                    </td>

                    {/* Status Pill & Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(qr)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-smooth ${
                          qr.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                        title="Clic para pausar o activar redirección"
                      >
                        <Power className="w-3 h-3" />
                        <span>{qr.status === "ACTIVE" ? "Activo" : "Pausado"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/qrcodes/${qr.id}`}
                          className="p-1.5 text-slate-500 hover:text-[#025CF3] hover:bg-blue-50 rounded-lg transition-smooth"
                          title="Ficha completa y descargas"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setActiveModalQr(qr)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-smooth"
                          title="Editar destino"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(qr)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-smooth"
                          title="Eliminar QR"
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

      {/* Instant Destination Update Modal */}
      {activeModalQr && (
        <DestinationUpdateModal
          isOpen={!!activeModalQr}
          onClose={() => setActiveModalQr(null)}
          qrId={activeModalQr.id}
          qrTitle={activeModalQr.title}
          shortCode={activeModalQr.shortCode}
          currentDestinationUrl={activeModalQr.destinationUrl}
          onSuccess={(newUrl) => {
            setQrcodes((prev) =>
              prev.map((item) =>
                item.id === activeModalQr.id ? { ...item, destinationUrl: newUrl } : item
              )
            );
          }}
        />
      )}
    </div>
  );
}

