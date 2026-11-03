"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DeviceDistributionChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ["#025CF3", "#010B47", "#10B981", "#F59E0B", "#8B5CF6"];

export default function DeviceDistributionChart({
  data,
}: DeviceDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No hay datos de dispositivos registrados.
      </div>
    );
  }

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              "Dispositivo",
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(1, 11, 71, 0.1)",
              border: "1px solid #E2E8F0",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom labels */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-slate-600 font-medium">{item.name}:</span>
            <span className="font-bold text-slate-900">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

