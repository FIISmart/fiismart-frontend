/**
 * MessageList — derulează mesajele și auto-scroll la nou conținut.
 *
 * Strategia de scroll: comparăm înălțimea anterioară a containerului cu
 * cea curentă. Dacă user-ul nu este "stuck to bottom" (a derulat în
 * sus), nu forțăm scroll — nu vrem să-l smulgem din lectură. Pentru
 * streaming auto-scroll-ul declanșează la fiecare update al
 * `streamingContent`.
 */
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { useChat } from "../context/ChatContext";
import { MessageBubble } from "./MessageBubble";
import { ToolCallCard } from "./ToolCallCard";

export function MessageList() {
  const {
    activeMessages,
    isStreaming,
    streamingContent,
    pendingToolCalls,
    error,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stuckToBottomRef = useRef(true);

  // Track whether the user is at the bottom (within a small epsilon).
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stuckToBottomRef.current = distance < 32;
  };

  useEffect(() => {
    if (!stuckToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeMessages.length, streamingContent, pendingToolCalls.length, isStreaming]);

  const liveAssistant: ChatMessage | null = isStreaming
    ? {
        role: "assistant",
        content: streamingContent,
        toolCalls: pendingToolCalls.length > 0 ? pendingToolCalls : undefined,
        ts: new Date().toISOString(),
      }
    : null;

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
    >
      {activeMessages.length === 0 && !liveAssistant && (
        <div className="m-auto max-w-[80%] text-center text-sm text-muted-foreground">
          <p className="font-medium">Salut! Sunt asistentul FIISmart.</p>
          <p className="mt-1">
            Întreabă-mă orice despre cursurile tale sau cere-mi să generez un
            quiz pe un anumit topic.
          </p>
        </div>
      )}

      {activeMessages.map((m, idx) => (
        <MessageBubble key={m.id ?? `${m.role}-${idx}`} message={m} />
      ))}

      {liveAssistant && <MessageBubble message={liveAssistant} live />}

      {/* Tool calls în curs de execuție (înainte ca asistentul să comite mesajul). */}
      {!liveAssistant && isStreaming && pendingToolCalls.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {pendingToolCalls.map((tc, idx) => (
            <ToolCallCard key={`pending-${tc.name}-${idx}`} toolCall={tc} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
