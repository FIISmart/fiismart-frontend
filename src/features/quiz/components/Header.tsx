import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { getHomePath } from "@/lib/routes";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-[#E5DDD4] bg-[#F2EAE0] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#5A4A3A] transition-colors hover:text-[#9B8EC7]"
          aria-label="Înapoi"
        >
          <ArrowLeft size={15} />
          <span className="hidden xs:inline">Înapoi</span>
        </button>
        <div className="shrink-0 font-bold text-[16px]">
          <span className="text-[#9B8EC7]">FII</span>
          <span className="text-black"> Smart</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />
        <Link
          to={getHomePath(user?.role)}
          className="hidden text-[14px] font-medium text-[#5A4A3A] transition-colors hover:text-[#9B8EC7] sm:inline"
        >
          Home
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
