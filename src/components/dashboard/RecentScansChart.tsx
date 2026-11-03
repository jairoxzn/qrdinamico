"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RecentScansChartProps {
  data: {
    date: string;
    scans: number;
    nfc: number;
  }[];
}

export default function RecentScansChart({ data }: RecentScansChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No hay datos suficientes de escaneo en este período.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#025CF3" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#025CF3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNfc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#010B47" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#010B47" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(1, 11, 71, 0.1)",
              border: "1px solid #E2E8F0",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", paddingTop: "0px" }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            name="Escaneos Totales (QR + NFC)"
            stroke="#025CF3"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorScans)"
          />
          <Area
            type="monotone"
            dataKey="nfc"
            name="Toques Físicos NFC"
            stroke="#010B47"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorNfc)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

