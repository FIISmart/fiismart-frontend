import { Bell, User, GraduationCap, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Ai fost deconectat.");
    navigate("/auth", { replace: true });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-2 text-primary font-bold text-xl">
          <GraduationCap size={28} />
          <span>FiiSmart</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            to="/student/dashboard"
            className="text-foreground border-b-2 border-primary pb-1"
          >
            Cursurile mele
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-muted-foreground">
          <button
            type="button"
            className="relative hover:text-foreground transition-colors"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-card" />
          </button>

          <div
            title={user?.email}
            className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center text-foreground"
          >
            <User size={16} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Deconectare"
            className="hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
