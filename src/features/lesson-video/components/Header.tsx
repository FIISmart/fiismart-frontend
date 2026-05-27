import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { getCoursesPath, getHomePath, getStatisticsPath } from "@/lib/routes";
import { Logo } from "@/components/brand/Logo";
import { UserMenu, accountPathForRole } from "@/components/layout/UserMenu";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const coursesPath = getCoursesPath(user?.role);
  const navItems = [
    { to: getHomePath(user?.role), label: "Dashboard" },
    { to: coursesPath, label: "Cursurile mele" },
    { to: getStatisticsPath(user?.role), label: "Statistici" },
    { to: accountPathForRole(user?.role), label: "Contul meu" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to={coursesPath} className="border-b-2 border-primary pb-1 text-foreground">
            Cursurile mele
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-muted-foreground">
          <NotificationBell />
          <UserMenu />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full p-2 hover:bg-muted md:hidden"
            aria-label="Meniu navigare"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mx-auto mt-3 grid max-w-7xl gap-1 border-t border-border pt-3 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(item.to);
              }}
              className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
