import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-edu-primary/10",
  iconColor = "text-edu-primary",
}: StatCardProps) {
  return (
    <div className="bg-edu-card border border-edu-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
      <div className="flex items-start gap-4">
        {/* Iconița cu fundal colorat */}
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}>{icon}</div>

        {/* Textele din dreapta iconiței */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold font-poppins text-edu-foreground">{value}</h3>
          <p className="text-sm font-medium text-edu-foreground mt-1">{title}</p>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-edu-muted-fg mt-4 pt-4 border-t border-edu-border/50">
          {subtitle}
        </p>
      )}
    </div>
  );
}
