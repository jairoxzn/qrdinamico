import Link from "next/link";
import { ExternalLink, QrCode, Radio, ArrowUpRight } from "lucide-react";

interface TopQRCodeItem {
  id: string;
  title: string;
  shortCode: string;
  destinationUrl: string;
  scanCount: number;
  status: string;
  _count?: {
    nfcCards: number;
  };
}

interface TopQRCodesTableProps {
  qrcodes: TopQRCodeItem[];
}

export default function TopQRCodesTable({ qrcodes }: TopQRCodesTableProps) {
  if (!qrcodes || qrcodes.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No hay códigos QR con tráfico registrado aún.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
          <tr>
            <th className="py-3 px-4">Código / Título</th>
            <th className="py-3 px-4">Destino Actual</th>
            <th className="py-3 px-4 text-center">NFCs</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-right">Escaneos</th>
            <th className="py-3 px-4 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {qrcodes.map((qr) => (
            <tr key={qr.id} className="hover:bg-slate-50/70 transition-smooth">
              <td className="py-3.5 px-4">
                <div className="font-bold text-[#010B47] text-sm">{qr.title}</div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#025CF3]">
                  <span>/q/{qr.shortCode}</span>
                </div>
              </td>

              <td className="py-3.5 px-4 max-w-[200px]">
                <div className="truncate text-slate-600" title={qr.destinationUrl}>
                  {qr.destinationUrl}
                </div>
              </td>

              <td className="py-3.5 px-4 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                  <Radio className="w-3 h-3 text-slate-500" />
                  {qr._count?.nfcCards ?? 0}
                </span>
              </td>

              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    qr.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {qr.status === "ACTIVE" ? "Activo" : "Pausado"}
                </span>
              </td>

              <td className="py-3.5 px-4 text-right font-extrabold text-[#010B47] text-sm">
                {qr.scanCount.toLocaleString("es-CO")}
              </td>

              <td className="py-3.5 px-4 text-center">
                <Link
                  href={`/dashboard/qrcodes/${qr.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#025CF3] bg-blue-50 hover:bg-[#025CF3] hover:text-white rounded-lg transition-smooth"
                >
                  <span>Ver</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

