import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  bgColorClass: string;
  to?: string;
}

export function ActionCard({ title, description, icon, bgColorClass, to }: ActionCardProps) {
  const navigate = useNavigate();
  return (
      <div
          onClick={() => to && navigate(to)}
          className={`${bgColorClass} p-6 rounded-2xl ${to ? "cursor-pointer" : ""} transition-all duration-300 hover:-translate-y-1 shadow-sm flex items-center gap-5`}
      >
        <div className="bg-white/20 p-3 rounded-xl text-white flex-shrink-0">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-bold font-poppins text-white">{title}</h3>
          <p className="text-sm font-medium text-white/90 mt-1">{description}</p>
        </div>
      </div>
  );
}