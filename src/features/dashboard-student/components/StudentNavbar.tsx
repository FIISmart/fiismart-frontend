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
    <nav className="relative h-20 w-full bg-[#F4EFE8] flex items-center justify-center px-4 md:px-12">
      <div className="max-w-[1280px] w-full flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#9b8ec7] rounded-[14px] flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={22} />
          </div>
          <div className="flex font-bold text-xl tracking-[-0.5px]">
            <span className="text-[#9b8ec7]">FII</span>
            <span className="text-[#2d2a3e] ml-1">Smart</span>
          </div>
        </Link>

        <div className="hidden lg:flex gap-10 text-[15px] font-semibold text-[#5a5470]">
          <Link to="/student/dashboard" className="hover:text-[#9b8ec7] transition-colors">
            Dashboard
          </Link>
          <Link to="/student/courses" className="hover:text-[#9b8ec7] transition-colors">
            Cursuri
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <NotificationBell className="hidden sm:block" />
          <div className="flex items-center gap-2.5 px-3 md:px-4 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-[#9b8ec7]">
              {initials}
            </div>
            <span className="text-[13.5px] font-bold text-[#333333] hidden sm:block">
              {studentName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Deconectare"
            className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
