"use client";

import Link from "next/link";
import { Plus, Radio, ExternalLink, Shield } from "lucide-react";
import { SessionUser } from "@/lib/types";

interface HeaderProps {
  user: SessionUser;
  onOpenNfcSimulator?: () => void;
}

export default function Header({ user, onOpenNfcSimulator }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-[#010B47] hidden sm:block">
          Plataforma de Control NFC & QR Dinámico
        </h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#025CF3] border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#025CF3] animate-pulse" />
          Producción Neon DB
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onOpenNfcSimulator && (
          <button
            onClick={onOpenNfcSimulator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-smooth"
            title="Probar lectura y redirección física de chips NFC"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Simulador NFC</span>
          </button>
        )}

        <Link
          href="/dashboard/qrcodes/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#025CF3] text-white hover:bg-[#0146BD] shadow-sm transition-smooth"
        >
          <Plus className="w-4 h-4" />
          <span>Crear QR</span>
        </Link>

        {/* User initials bubble */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-[#010B47] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user.name.slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
}

