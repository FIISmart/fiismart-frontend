import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/features/auth/context/AuthContext";

export function ProfDashboardNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Profesor";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const navItems = [
    { to: "/professor/dashboard", label: "Dashboard" },
    { to: "/professor/courses", label: "Cursuri" },
    { to: "/professor/quizzes", label: "Quiz-uri" },
    { to: "/professor/statistics", label: "Statistici" },
    { to: "/professor/mentor-requests", label: "Mentorat" },
  ];

  return (
    <header className="w-full bg-edu-bg border-b border-edu-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo textClassName="text-xl md:text-2xl font-poppins" />
        </div>

        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap text-edu-muted-fg font-medium hover:text-edu-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu displayName={displayName} initials={initials} />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full p-2 text-edu-muted-fg hover:bg-edu-border lg:hidden"
            aria-label="Meniu navigare"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mx-auto max-w-7xl border-t border-edu-border px-4 py-3 lg:hidden sm:px-6 lg:px-8">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.to);
                }}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-edu-muted-fg hover:bg-edu-card"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/professor/account");
              }}
              className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-edu-muted-fg hover:bg-edu-card"
            >
              Contul meu
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
