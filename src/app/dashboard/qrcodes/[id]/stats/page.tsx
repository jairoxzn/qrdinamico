"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  QrCode,
  Radio,
  Smartphone,
  Globe,
  Loader2,
  Calendar,
  Layers,
  Monitor,
} from "lucide-react";
import RecentScansChart from "@/components/dashboard/RecentScansChart";
import DeviceDistributionChart from "@/components/dashboard/DeviceDistributionChart";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import StatCard from "@/components/dashboard/StatCard";

export default function QRStatsPage() {
  const params = useParams();
  const id = params.id as string;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/qrcodes/${id}/stats`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#025CF3] mb-3" />
        Calculando estadísticas y métricas del código QR...
      </div>
    );
  }

  const qr = stats?.qrInfo || {};
  const summary = stats?.summary || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Link
          href={`/dashboard/qrcodes/${id}`}
          className="p-2 text-slate-500 hover:text-[#010B47] hover:bg-slate-100 rounded-xl transition-smooth"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
            Analítica: {qr.title}
          </h2>
          <p className="text-xs text-slate-500">
            Identificador <span className="font-mono text-[#025CF3] font-bold">/q/{qr.shortCode}</span> • Destino: {qr.destinationUrl}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Escaneos Totales"
          value={summary.totalScans ?? 0}
          subtitle="Interacciones acumuladas"
          icon={BarChart3}
          color="blue"
        />

        <StatCard
          title="Escaneos por Cámara QR"
          value={summary.qrScans ?? 0}
          subtitle={`${summary.totalScans > 0 ? ((summary.qrScans / summary.totalScans) * 100).toFixed(0) : 0}% del volumen`}
          icon={QrCode}
          color="emerald"
        />

        <StatCard
          title="Toques por Chip NFC"
          value={summary.nfcTaps ?? 0}
          subtitle={`${summary.totalScans > 0 ? ((summary.nfcTaps / summary.totalScans) * 100).toFixed(0) : 0}% del volumen`}
          icon={Radio}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
          <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider mb-2">
            Tráfico en los Últimos 7 Días
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Volumen diario de redirecciones completadas con éxito
          </p>
          <RecentScansChart data={stats?.dailyChart || []} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider mb-2">
              Dispositivos
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hardware utilizado por los visitantes
            </p>
          </div>
          <DeviceDistributionChart data={stats?.deviceChart || []} />
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
        <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider mb-4">
          Últimos 30 Registros de Escaneo
        </h3>
        <RecentActivityTable scans={stats?.recentLogs || []} />
      </div>
    </div>
  );
}

