import type { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  bgColorClass: string; // Used for the icon background now
}

export function ActionCard({ title, description, icon, bgColorClass }: ActionCardProps) {
  return (
    <div
      className="bg-white p-6 rounded-[22px] cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm border border-black/5 flex items-center gap-5"
    >
      <div className={`${bgColorClass} p-3 rounded-[16px] text-white flex-shrink-0 shadow-sm`}>
        {icon}
      </div>

      <div>
        <h3 className="text-[17px] font-bold text-[#1a1a2e]">{title}</h3>
        <p className="text-[13px] font-medium text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
