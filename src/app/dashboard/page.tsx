"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Radio,
  BarChart3,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Users,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentScansChart from "@/components/dashboard/RecentScansChart";
import DeviceDistributionChart from "@/components/dashboard/DeviceDistributionChart";
import TopQRCodesTable from "@/components/dashboard/TopQRCodesTable";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-[#025CF3]/20 border-t-[#025CF3] rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Cargando métricas y estado del sistema...
        </p>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
            Panel de Control Dinámico
          </h2>
          <p className="text-sm text-slate-500">
            Supervisión en tiempo real de códigos QR dinámicos y chips NFC de JAIROSYSTEN
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-soft transition-smooth disabled:opacity-50"
            title="Refrescar métricas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#025CF3]" : ""}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/dashboard/qrcodes/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#025CF3] text-white hover:bg-[#0146BD] shadow-md hover:shadow-glow transition-smooth"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Código QR</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Códigos QR Totales"
          value={kpis.totalQRs ?? 0}
          subtitle={`${kpis.activeQRs ?? 0} activos • ${kpis.suspendedQRs ?? 0} pausados`}
          icon={QrCode}
          color="blue"
          badgeText="100% Dinámicos"
        />

        <StatCard
          title="Tarjetas NFC Vinculadas"
          value={kpis.totalNfc ?? 0}
          subtitle={`${kpis.assignedNfc ?? 0} asociadas • ${kpis.unassignedNfc ?? 0} vírgenes`}
          icon={Radio}
          color="navy"
          badgeText="NDEF NTAG"
        />

        <StatCard
          title="Total Escaneos y Taps"
          value={(kpis.totalScans ?? 0).toLocaleString("es-CO")}
          subtitle={`${kpis.todayScans ?? 0} registrados hoy`}
          icon={BarChart3}
          color="emerald"
          badgeText="Tiempo Real"
        />

        {kpis.totalClients !== undefined && kpis.totalClients > 0 ? (
          <StatCard
            title="Clientes Corporativos"
            value={kpis.totalClients}
            subtitle="Cuentas gestionadas"
            icon={Users}
            color="purple"
            badgeText="Multi-Inquilino"
          />
        ) : (
          <StatCard
            title="Tasa de Actividad"
            value={`${kpis.totalQRs > 0 ? ((kpis.activeQRs / kpis.totalQRs) * 100).toFixed(0) : 0}%`}
            subtitle="Disponibilidad del parque QR"
            icon={TrendingUp}
            color="amber"
            badgeText="Alta Eficiencia"
          />
        )}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans Timeline Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
                Evolución de Tráfico (Últimos 7 Días)
              </h3>
              <p className="text-xs text-slate-500">
                Comparativa entre escaneos de cámara QR y toques por chip NFC
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#025CF3] rounded-lg border border-blue-100">
              Métricas Diarias
            </span>
          </div>

          <RecentScansChart data={data?.activityTimeline || []} />
        </div>

        {/* Device Breakdown Donut Chart (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
                Dispositivos de Entrada
              </h3>
              <Smartphone className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribución de usuarios según hardware detectado
            </p>
          </div>

          <DeviceDistributionChart data={data?.deviceBreakdown || []} />
        </div>
      </div>

      {/* Top Performing QRs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
              Códigos QR y Tarjetas Más Populares
            </h3>
            <p className="text-xs text-slate-500">
              Elementos con mayor volumen de redirecciones y toques acumulados
            </p>
          </div>

          <Link
            href="/dashboard/qrcodes"
            className="text-xs font-semibold text-[#025CF3] hover:underline inline-flex items-center gap-1"
          >
            <span>Ver todos los códigos</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TopQRCodesTable qrcodes={data?.topQRs || []} />
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
              Registro de Escaneos en Tiempo Real
            </h3>
            <p className="text-xs text-slate-500">
              Últimas conexiones procesadas con redirección HTTP 307 temporal
            </p>
          </div>

          <Link
            href="/dashboard/stats"
            className="text-xs font-semibold text-[#025CF3] hover:underline inline-flex items-center gap-1"
          >
            <span>Ver analítica completa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RecentActivityTable scans={data?.latestScans || []} />
      </div>
    </div>
  );
}

