import { Bell, BookOpen, GraduationCap, MessageSquare } from "lucide-react";
import type { NotificationAPI } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Chiar acum";
  if (mins < 60) return `Acum ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Acum ${hours}h`;
  return `Acum ${Math.floor(hours / 24)}z`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "ENROLLMENT") return <BookOpen size={16} className="text-emerald-500" />;
  if (type === "NEW_COMMENT") return <MessageSquare size={16} className="text-blue-500" />;
  if (type === "COMMENT_REPLY") return <MessageSquare size={16} className="text-[#9b8ec7]" />;
  if (type === "COURSE_UPDATE") return <GraduationCap size={16} className="text-amber-500" />;
  return <Bell size={16} className="text-gray-400" />;
}

interface NotificationPanelProps {
  notifications: NotificationAPI[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}

export default function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-9 w-80 bg-white rounded-2xl shadow-xl border border-black/5 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-sm text-gray-800">Notificări</span>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void onMarkAllRead()}
            className="text-xs text-[#9b8ec7] font-semibold hover:underline"
          >
            Marchează toate citite
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell size={24} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Nicio notificare</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && void onMarkRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                n.read
                  ? "opacity-60"
                  : "bg-[#9b8ec7]/5 cursor-pointer hover:bg-[#9b8ec7]/10"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-[#9b8ec7] flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
