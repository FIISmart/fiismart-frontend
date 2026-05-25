import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users",     icon: Users,           label: "Utilizatori" },
  { to: "/admin/courses",   icon: BookOpen,        label: "Cursuri" },
  { to: "/admin/enrollments", icon: GraduationCap, label: "Înrolări" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-border",
        "w-64 h-full"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="font-serif font-bold text-lg text-foreground">Admin Panel</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground truncate mb-1">{user?.email}</p>
        <p className="text-xs font-semibold text-primary mb-3">Administrator</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-serif font-bold text-xl text-foreground">{title}</h1>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
