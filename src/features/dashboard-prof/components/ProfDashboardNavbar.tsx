import { useState } from "react";
import { UserCircle, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { Logo } from "@/components/brand/Logo";

const NAV_LINKS = [
  { to: "/professor/dashboard", label: "Dashboard" },
  { to: "/professor/courses", label: "Cursuri" },
  { to: "/professor/statistics", label: "Statistici" },
  { to: "/professor/mentor-requests", label: "Mentorat" },
];

export function ProfDashboardNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Ai fost deconectat.");
    navigate("/auth", { replace: true });
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Profesor";

  return (
    <header className="w-full bg-edu-bg border-b border-edu-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 rounded-md text-edu-foreground hover:bg-edu-border hover:text-edu-primary transition"
            aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={menuOpen}
            aria-controls="prof-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Logo textClassName="text-xl md:text-2xl font-poppins" />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-edu-muted-fg font-medium hover:text-edu-primary transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="flex items-center gap-3 border border-edu-border p-2 md:px-4 md:py-2 rounded-full cursor-default">
            <UserCircle size={24} className="text-edu-muted-fg" />
            <span className="hidden md:inline text-edu-foreground font-medium">{displayName}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Deconectare"
            className="p-2 rounded-full hover:bg-edu-border text-edu-muted-fg hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown — visible only when menuOpen on <md screens.
          Closes on link click (browser navigation re-renders won't preserve it). */}
      {menuOpen && (
        <div
          id="prof-mobile-nav"
          className="md:hidden border-t border-edu-border bg-edu-bg shadow-sm"
        >
          <ul className="flex flex-col gap-1 max-w-7xl mx-auto px-4 sm:px-6 py-3">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-edu-foreground font-medium hover:bg-edu-border hover:text-edu-primary transition"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
