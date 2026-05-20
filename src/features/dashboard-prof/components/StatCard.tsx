import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor?: string; // Kept for API compatibility but we'll use a soft style
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[22px] flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 md:gap-5 shadow-sm border border-black/[0.02] transition-all hover:-translate-y-0.5">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-[16px] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="text-center md:text-left">
        <div className="text-[18px] md:text-[23px] font-extrabold text-[#1a1a2e] leading-none mb-1.5">
          {value}
        </div>
        <div className="text-[8px] md:text-[9.5px] text-gray-400 font-black tracking-[0.08em] uppercase">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] text-gray-400 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
