import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default function QrSuspendedPage({
  params,
}: {
  params: { code: string };
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-slate-200 p-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5 ring-8 ring-amber-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full mb-3">
          Código QR Inactivo
        </span>

        <h1 className="text-2xl font-bold text-[#010B47] mb-2">
          Enlace Temporalmente Suspendido
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          El código QR o tarjeta NFC con identificador{" "}
          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
            {params.code}
          </span>{" "}
          ha sido pausado temporalmente por el propietario del servicio o administrador.
        </p>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 mb-6 text-left">
          <div className="flex items-center gap-2 font-medium text-slate-700 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            ¿Qué significa esto?
          </div>
          No se ha eliminado el acceso ni el código físico. La redirección se reanudará en cuanto el titular reactive este elemento desde su panel de control.
        </div>

        <div className="text-xs text-slate-400">
          Tecnología provista por{" "}
          <span className="font-semibold text-[#025CF3]">JAIROSYSTEN</span>
        </div>
      </div>
    </div>
  );
}

