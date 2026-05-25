/**
 * ChatInput — textarea cu auto-resize + Send.
 *
 * Comportament:
 *   - Enter trimite, Shift+Enter inserează newline.
 *   - Disabled cât timp `isStreaming` (un singur mesaj in flight la un moment dat).
 *   - Auto-resize manual între 44px și 140px (nu adăugăm o dependență doar pentru
 *     atât — clasele Tailwind + ajustarea height-ului via ref e suficient).
 */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "../context/ChatContext";

const MAX_HEIGHT_PX = 140;

export function ChatInput() {
  const { send, isStreaming } = useChat();
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  // Mutex against double-Enter: two rapid presses within a single React
  // batch both see `isStreaming === false` (state hasn't propagated yet) and
  // both fire `send()`. A ref flips synchronously and blocks the second call.
  const submittingRef = useRef(false);

  // Recalculează înălțimea când conținutul se schimbă.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, MAX_HEIGHT_PX);
    ta.style.height = `${next}px`;
  }, [value]);

  const submit = async () => {
    const trimmed = value.trim();
    if (submittingRef.current || !trimmed || isStreaming) return;
    submittingRef.current = true;
    try {
      setValue("");
      await send(trimmed);
    } finally {
      submittingRef.current = false;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <Textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          isStreaming
            ? "Aștept răspunsul..."
            : "Scrie un mesaj... (Enter = trimite, Shift+Enter = linie nouă)"
        }
        rows={1}
        disabled={isStreaming}
        className="min-h-[44px] flex-1 resize-none"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Trimite"
        disabled={isStreaming || value.trim().length === 0}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
