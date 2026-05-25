/**
 * ThreadList — lista de thread-uri (max 20 cele mai recente).
 *
 * Vizualizare alternativă în `ChatPanel`: clic pe rând selectează
 * thread-ul + revine la vederea mesajelor; clic pe coșul de gunoi
 * șterge (cu confirm()). Butonul de sus inițiază un thread nou.
 */
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat } from "../context/ChatContext";

interface Props {
  onSelected: () => void;
}

/** Formatează timestamp-ul ISO ca "Xs ago" / "Xm ago" / "Xh ago" / "Xd ago". */
function relativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

export function ThreadList({ onSelected }: Props) {
  const {
    sessions,
    activeSessionId,
    selectThread,
    deleteThread,
    newThread,
  } = useChat();

  const handleSelect = async (id: string) => {
    await selectThread(id);
    onSelected();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Sigur ștergi conversația?")) return;
    await deleteThread(id);
  };

  const handleNew = async () => {
    await newThread();
    onSelected();
  };

  // Cap la 20 ca să nu lungim sidebar-ul; server-side e deja limit similar.
  const visible = sessions.slice(0, 20);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleNew}
        >
          <Plus className="size-4" />
          Conversație nouă
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {visible.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Nu există încă nicio conversație. Trimite un mesaj ca să începi.
          </p>
        ) : (
          <ul className="flex flex-col p-2">
            {visible.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s.id)}
                    className={cn(
                      "group flex w-full items-center justify-between gap-2 rounded-md p-2 text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {s.title || "Conversație fără titlu"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {relativeTime(s.updatedAt)}
                      </span>
                    </span>
                    <span
                      aria-label="Șterge conversația"
                      onClick={(e) => handleDelete(s.id, e)}
                      className={cn(
                        "shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity",
                        "group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive",
                      )}
                      role="button"
                    >
                      <Trash2 className="size-4" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
