import type { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  bgColorClass: string;
}

export function ActionCard({ title, description, icon, bgColorClass }: ActionCardProps) {
  return (
    <div
      className={`${bgColorClass} p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex items-center gap-5 border border-white/20`}
    >
      <div className="bg-white/30 p-3 rounded-xl text-edu-foreground flex-shrink-0">{icon}</div>

      <div>
        <h3 className="text-xl font-bold font-poppins text-edu-foreground">{title}</h3>
        <p className="text-sm font-medium text-edu-foreground/80 mt-1">{description}</p>
      </div>
    </div>
  );
}
