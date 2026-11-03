import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "navy" | "emerald" | "amber" | "purple";
  badgeText?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  badgeText,
}: StatCardProps) {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-[#025CF3]",
      border: "border-blue-100",
    },
    navy: {
      bg: "bg-slate-100",
      text: "text-[#010B47]",
      border: "border-slate-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
  };

  const style = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft hover:shadow-card transition-smooth">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${style.bg} ${style.text} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-[#010B47] tracking-tight">
          {value}
        </div>
        {badgeText && (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-xs text-slate-500 mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}

