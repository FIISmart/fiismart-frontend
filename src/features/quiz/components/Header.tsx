import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full h-[49px] bg-[#F2EAE0] border-b border-[#E5DDD4] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#5A4A3A] hover:text-[#9B8EC7] transition-colors"
          aria-label="Înapoi"
        >
          <ArrowLeft size={15} />
          Înapoi
        </button>
        <div className="font-bold text-[16px]">
          <span className="text-[#9B8EC7]">FII</span>
          <span className="text-black"> Smart</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <Link
          to="/student/dashboard"
          className="text-[14px] font-medium text-[#5A4A3A] hover:text-[#9B8EC7] transition-colors"
        >
          Home
        </Link>
      </div>
    </header>
  );
}
