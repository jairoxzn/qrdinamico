"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  QrCode,
  Radio,
  Smartphone,
  Globe2,
  Calendar,
  Loader2,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentScansChart from "@/components/dashboard/RecentScansChart";
import DeviceDistributionChart from "@/components/dashboard/DeviceDistributionChart";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";

export default function GeneralStatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#025CF3] mb-3" />
        Generando reportes estadísticos consolidados...
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
          Analítica Global y Métricas de Escaneo
        </h2>
        <p className="text-sm text-slate-500">
          Comportamiento de audiencia, distribución geográfica e interacción física NFC
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Escaneos Totales"
          value={(kpis.totalScans ?? 0).toLocaleString("es-CO")}
          subtitle="Redirecciones dinámicas"
          icon={BarChart3}
          color="blue"
        />

        <StatCard
          title="Escaneos Hoy"
          value={(kpis.todayScans ?? 0).toLocaleString("es-CO")}
          subtitle="Últimas 24 horas"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Tarjetas NFC Activas"
          value={kpis.assignedNfc ?? 0}
          subtitle={`De ${kpis.totalNfc ?? 0} chips en inventario`}
          icon={Radio}
          color="navy"
        />

        <StatCard
          title="Códigos QR en Redirección"
          value={kpis.activeQRs ?? 0}
          subtitle={`${kpis.suspendedQRs ?? 0} códigos pausados`}
          icon={QrCode}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
                Curva de Escaneos por Día
              </h3>
              <p className="text-xs text-slate-500">
                Comparativa directa entre escaneos con cámara QR y toques NFC
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#025CF3] rounded-lg border border-blue-100">
              Últimos 7 Días
            </span>
          </div>

          <RecentScansChart data={data?.activityTimeline || []} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider mb-2">
              Plataformas y Hardware
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tipos de dispositivos que interactúan con sus códigos
            </p>
          </div>

          <DeviceDistributionChart data={data?.deviceBreakdown || []} />
        </div>
      </div>

      {/* Full Live Scans Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
              Registro Detallado de Sesiones
            </h3>
            <p className="text-xs text-slate-500">
              Últimos eventos registrados con geolocalización y canal de entrada
            </p>
          </div>
        </div>

        <RecentActivityTable scans={data?.latestScans || []} />
      </div>
    </div>
  );
}

