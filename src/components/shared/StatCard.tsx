import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  className = "",
}: StatCardProps) {
  if (variant === "compact") {
    return (
      <div
        className={`bg-card p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 md:gap-5 shadow-sm border border-border transition-all hover:-translate-y-0.5 ${className}`}
      >
        {icon && (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="text-center md:text-left">
          <div className="text-2xl md:text-3xl font-extrabold text-foreground leading-none mb-1.5">
            {value}
          </div>
          <div className="text-[8px] md:text-[9.5px] text-muted-foreground font-black tracking-[0.08em] uppercase">
            {title}
          </div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 md:hidden">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center ${className}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </h3>
          <p className="text-sm font-medium text-foreground mt-1">{title}</p>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
          {subtitle}
        </p>
      )}
    </div>
  );
}