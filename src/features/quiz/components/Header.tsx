import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full h-[49px] bg-background border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:text-primary transition-colors h-auto p-0"
          aria-label="Înapoi"
        >
          <ArrowLeft className="size-4" />
          Înapoi
        </Button>
        <div className="font-bold text-[16px] text-primary">FIISmart</div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <Button
          variant="link"
          onClick={() => navigate("/student/dashboard")}
          className="text-[14px] font-medium text-foreground hover:text-primary transition-colors h-auto p-0"
        >
          Home
        </Button>
      </div>
    </header>
  );
}