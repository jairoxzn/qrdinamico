import Link from "next/link";
import { HelpCircle, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

export default function QrNotFoundPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const code = searchParams.code || "desconocido";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-slate-200 p-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-5 ring-8 ring-rose-50/50">
          <QrCode className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-rose-600 bg-rose-100/60 px-3 py-1 rounded-full mb-3">
          No Encontrado
        </span>

        <h1 className="text-2xl font-bold text-[#010B47] mb-2">
          Código QR o NFC Inexistente
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          No existe ningún código QR o tarjeta NFC activa registrada con el código identificador{" "}
          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
            {code}
          </span>
          .
        </p>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 mb-6 text-left">
          <div className="flex items-center gap-2 font-medium text-slate-700 mb-1">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Verifique la URL
          </div>
          Asegúrese de haber escaneado el código correctamente o de que la tarjeta NFC no haya sido dada de baja.
        </div>

        <div className="text-xs text-slate-400">
          Plataforma <span className="font-semibold text-[#025CF3]">JAIROSYSTEN</span>
        </div>
      </div>
    </div>
  );
}

