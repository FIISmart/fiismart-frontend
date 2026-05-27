import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { Logo } from "@/components/brand/Logo";

interface StudentNavbarProps {
  studentName: string;
  initials: string;
}

const NAV_LINKS = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/courses", label: "Cursuri" },
  { to: "/student/statistics", label: "Statistici" },
  { to: "/student/mentors", label: "Mentorat" },
];

export function StudentNavbar({ studentName, initials }: StudentNavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Ai fost deconectat.");
    navigate("/auth", { replace: true });
  };

  return (
    <nav className="relative w-full bg-[#F4EFE8]">
      <div className="h-20 px-4 md:px-12 flex items-center justify-center">
        <div className="max-w-[1280px] w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-md text-[#5a5470] hover:bg-black/5 transition-colors"
              aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={menuOpen}
              aria-controls="student-mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Logo iconClassName="h-10 w-10 rounded-[14px]" textClassName="tracking-[-0.5px]" />
          </div>

          <div className="hidden lg:flex gap-10 text-[15px] font-semibold text-[#5a5470]">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-[#9b8ec7] transition-colors">
                {l.label}
              </Link>
            ))}
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
      </div>

      {/* Mobile dropdown — visible only when menuOpen on <lg screens.
          Closes on link click (browser navigation re-renders won't preserve it). */}
      {menuOpen && (
        <div
          id="student-mobile-nav"
          className="lg:hidden border-t border-black/5 bg-[#F4EFE8] px-4 py-3 shadow-sm"
        >
          <ul className="flex flex-col gap-1 max-w-[1280px] mx-auto">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-[15px] font-semibold text-[#5a5470] hover:text-[#9b8ec7] hover:bg-black/5 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
