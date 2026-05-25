import { GraduationCap, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { NotificationBell } from "@/features/notifications/NotificationBell";

interface StudentNavbarProps {
  studentName: string;
  initials: string;
}

export function StudentNavbar({ studentName, initials }: StudentNavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Ai fost deconectat.");
    navigate("/auth", { replace: true });
  };

  return (
    <nav className="relative h-20 w-full bg-background flex items-center justify-center px-4 md:px-12">
      <div className="max-w-[1280px] w-full flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <div className="flex font-bold text-xl tracking-[-0.5px]">
            <span className="text-primary font-bold text-xl tracking-[-0.5px]">FIISmart</span>
          </div>
        </Link>

        <div className="hidden lg:flex gap-10 text-[15px] font-semibold text-muted-foreground">
          <Link to="/student/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/student/courses" className="hover:text-primary transition-colors">
            Cursuri
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <NotificationBell className="hidden sm:block" />
          <div className="flex items-center gap-2.5 px-3 md:px-4 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
              {initials}
            </div>
            <span className="text-[13.5px] font-bold text-foreground hidden sm:block">
              {studentName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Deconectare"
            className="p-2 rounded-full hover:bg-black/5 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
