import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuthenticatedLayout } from "@/components/layout/AuthenticatedLayoutContext";

interface StudentNavbarProps {
  studentName: string;
  initials: string;
  forceVisible?: boolean;
}

export function StudentNavbar({ studentName, initials, forceVisible = false }: StudentNavbarProps) {
  const insideGlobalLayout = useAuthenticatedLayout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (insideGlobalLayout && !forceVisible) return null;

  const navItems = [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/courses", label: "Cursuri" },
    { to: "/student/tutors", label: "Tutori" },
    { to: "/student/mentor-requests", label: "Mentorat" },
    { to: "/student/statistics", label: "Statistici" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F4EFE8]/95 px-4 backdrop-blur md:px-12">
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between">
        <Logo iconClassName="h-10 w-10 rounded-[14px]" textClassName="tracking-[-0.5px]" />

        <div className="hidden items-center gap-7 text-[15px] font-semibold text-[#5a5470] lg:flex">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap hover:text-[#9b8ec7] transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          <UserMenu displayName={studentName} initials={initials} variant="warm" />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full p-2 text-[#5a5470] hover:bg-black/5 lg:hidden"
            aria-label="Meniu navigare"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mx-auto max-w-[1280px] border-t border-black/5 py-3 lg:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.to);
                }}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#5a5470] hover:bg-white"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/student/account");
              }}
              className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#5a5470] hover:bg-white"
            >
              Contul meu
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
