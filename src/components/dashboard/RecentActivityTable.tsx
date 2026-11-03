import { Smartphone, Monitor, Tablet, Radio, QrCode, Globe2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface ScanEvent {
  id: string;
  source?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  city?: string | null;
  country?: string | null;
  scannedAt: string;
  qrCode?: {
    id: string;
    title: string;
    shortCode: string;
  };
}

interface RecentActivityTableProps {
  scans: ScanEvent[];
}

export default function RecentActivityTable({ scans }: RecentActivityTableProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No hay actividad de escaneos reciente.
      </div>
    );
  }

  const getDeviceIcon = (deviceType?: string | null) => {
    switch (deviceType) {
      case "Mobile":
        return <Smartphone className="w-3.5 h-3.5 text-blue-600" />;
      case "Tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
          <tr>
            <th className="py-3 px-4">Método</th>
            <th className="py-3 px-4">Código QR</th>
            <th className="py-3 px-4">Dispositivo y SO</th>
            <th className="py-3 px-4">Navegador</th>
            <th className="py-3 px-4">Ubicación</th>
            <th className="py-3 px-4 text-right">Tiempo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {scans.map((scan) => (
            <tr key={scan.id} className="hover:bg-slate-50/70 transition-smooth">
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    scan.source === "NFC"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-blue-50 text-[#025CF3] border border-blue-200"
                  }`}
                >
                  {scan.source === "NFC" ? (
                    <>
                      <Radio className="w-3 h-3 text-indigo-600" />
                      <span>NFC Tap</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-3 h-3 text-[#025CF3]" />
                      <span>Cámara QR</span>
                    </>
                  )}
                </span>
              </td>

              <td className="py-3 px-4">
                <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                  {scan.qrCode?.title || "Código QR"}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  /q/{scan.qrCode?.shortCode}
                </div>
              </td>

              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 text-slate-700">
                  {getDeviceIcon(scan.deviceType)}
                  <span className="font-medium">{scan.deviceType || "Desktop"}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {scan.os || "Sistema desconocido"}
                </div>
              </td>

              <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]">
                {scan.browser || "Navegador Web"}
              </td>

              <td className="py-3 px-4">
                <div className="flex items-center gap-1 text-slate-700">
                  <Globe2 className="w-3 h-3 text-slate-400" />
                  <span>{scan.city || "Colombia"}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {scan.country || "IP Protegida"}
                </div>
              </td>

              <td className="py-3 px-4 text-right font-medium text-slate-500 whitespace-nowrap">
                {formatTimeAgo(scan.scannedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

