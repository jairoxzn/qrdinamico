"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  PlusCircle,
  Radio,
  Users,
  BarChart3,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { SessionUser } from "@/lib/types";

interface SidebarProps {
  user: SessionUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error al salir:", err);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Códigos QR",
      href: "/dashboard/qrcodes",
      icon: QrCode,
      exact: false,
    },
    {
      title: "Nuevo Código QR",
      href: "/dashboard/qrcodes/new",
      icon: PlusCircle,
      exact: true,
    },
    {
      title: "Tarjetas NFC",
      href: "/dashboard/nfc",
      icon: Radio,
      exact: false,
    },
    ...(user.role === "ADMIN"
      ? [
          {
            title: "Gestión de Clientes",
            href: "/dashboard/clients",
            icon: Users,
            exact: false,
          },
        ]
      : []),
    {
      title: "Estadísticas y Analítica",
      href: "/dashboard/stats",
      icon: BarChart3,
      exact: false,
    },
    {
      title: "Historial de Cambios",
      href: "/dashboard/history",
      icon: History,
      exact: false,
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isActive = (itemHref: string, exact: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  return (
    <aside className="w-64 bg-[#010B47] text-white flex flex-col flex-shrink-0 min-h-screen border-r border-[#0A176B]/40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#025CF3] flex items-center justify-center shadow-glow">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="block text-[10px] font-bold tracking-widest uppercase text-blue-300">
            JAIROSYSTEN
          </span>
          <span className="block text-sm font-bold tracking-tight text-white leading-tight">
            NFC Smart QR
          </span>
        </div>
      </div>

      {/* Role and User Badge */}
      <div className="px-5 py-4 border-b border-white/5 bg-[#000629]/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400">USUARIO CONECTADO</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              user.role === "ADMIN"
                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
            }`}
          >
            {user.role}
          </span>
        </div>
        <div className="font-semibold text-sm text-slate-100 truncate">{user.name}</div>
        <div className="text-xs text-slate-400 truncate">{user.company || user.email}</div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Módulos Principales
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-smooth group ${
                active
                  ? "bg-[#025CF3] text-white shadow-md font-semibold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    active ? "text-white" : "text-blue-300"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10 bg-[#000629]/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 rounded-xl transition-smooth"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

