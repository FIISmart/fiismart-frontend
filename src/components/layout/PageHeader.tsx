import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}