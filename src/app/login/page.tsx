"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, Radio, ArrowRight, ShieldCheck, Lock, Mail, Loader2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200 sm:px-10">
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@xhionsoft.com"
              className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] focus:border-transparent transition-smooth"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contraseña
            </label>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] focus:border-transparent transition-smooth"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#025CF3] hover:bg-[#0146BD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#025CF3] shadow-md hover:shadow-glow transition-smooth disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#025CF3]" />
          <span>Accesos Rápidos de Prueba (1-Clic)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@xhionsoft.com", "adminpassword123")}
            className="p-2.5 text-left border border-slate-200 rounded-xl hover:border-[#025CF3] hover:bg-blue-50/50 transition-smooth group"
          >
            <div className="text-xs font-bold text-[#010B47] group-hover:text-[#025CF3]">
              ADMINISTRADOR
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              admin@xhionsoft.com
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("cliente@innovacion.com", "clientepassword123")}
            className="p-2.5 text-left border border-slate-200 rounded-xl hover:border-[#025CF3] hover:bg-blue-50/50 transition-smooth group"
          >
            <div className="text-xs font-bold text-[#010B47] group-hover:text-[#025CF3]">
              CLIENTE (Retail)
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              cliente@innovacion.com
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center gap-2.5 bg-[#010B47] text-white p-3 rounded-2xl shadow-card mb-4">
          <div className="p-2 bg-[#025CF3] rounded-xl">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div className="text-left pr-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-blue-300">
              XhionSoft Technologies
            </span>
            <span className="block text-base font-extrabold tracking-tight">
              NFC Smart QR Manager
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[#010B47]">
          Iniciar sesión en su cuenta
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Gestione sus códigos QR dinámicos y tarjetas NFC en tiempo real
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={
          <div className="bg-white py-12 px-6 shadow-card rounded-2xl border border-slate-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#025CF3] mx-auto mb-2" />
            <p className="text-xs text-slate-400">Cargando formulario seguro...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Security badge footer */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Redirección dinámica segura y cifrado SSL activo</span>
        </div>
      </div>
    </div>
  );
}
