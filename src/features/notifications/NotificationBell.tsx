import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";
import NotificationPanel from "./NotificationPanel";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  // Închide panel-ul la click în afara lui
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="relative p-1 text-gray-400 hover:text-[#9b8ec7] transition-colors"
        aria-label="Notificări"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
}
