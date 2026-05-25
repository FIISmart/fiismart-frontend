import { UserCircle, Menu, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export function ProfDashboardNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
          <button className="md:hidden text-edu-foreground hover:text-edu-primary transition">
            <Menu className="size-6" />
          </button>
          <Link to="/professor/dashboard">
            <h1 className="text-xl md:text-2xl font-bold font-poppins text-edu-primary">
              FIISmart
            </h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/professor/dashboard"
            className="text-edu-foreground font-medium hover:text-edu-primary transition"
          >
            Dashboard
          </Link>
          <Link
            to="/professor/courses"
            className="text-edu-muted-fg font-medium hover:text-edu-primary transition"
          >
            Cursuri
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="flex items-center gap-3 border border-edu-border p-2 md:px-4 md:py-2 rounded-full cursor-default">
            <UserCircle className="size-6 text-edu-muted-fg" />
            <span className="hidden md:inline text-edu-foreground font-medium">{displayName}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Deconectare"
            className="p-2 rounded-full hover:bg-edu-border text-edu-muted-fg hover:text-red-500 transition-colors"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
