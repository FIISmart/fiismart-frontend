/**
 * FloatingChatButton — buton circular bottom-right care deschide panoul de chat.
 *
 * Vizibilitatea (autentificat / nu) este gestionată de mount-ul global din
 * `App.tsx`; componenta în sine doar randează. Dacă există un stream în
 * desfășurare în timp ce panoul e închis, afișăm un mic dot ca să-l atragem
 * pe user înapoi.
 */
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "../context/ChatContext";

export function FloatingChatButton() {
  const { open, isOpen, isStreaming } = useChat();

  return (
    <button
      type="button"
      aria-label="Deschide chat"
      onClick={open}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-primary-foreground shadow-lg",
        "transition-transform hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Ascunde butonul când panoul e deja deschis ca să nu se suprapună
        // cu marginea Sheet-ului pe ecrane mici.
        isOpen && "pointer-events-none opacity-0",
      )}
    >
      <MessageCircle className="size-6" />
      {isStreaming && !isOpen && (
        <span
          aria-hidden
          className="absolute right-1 top-1 size-3 animate-pulse rounded-full bg-emerald-400 ring-2 ring-background"
        />
      )}
    </button>
  );
}
