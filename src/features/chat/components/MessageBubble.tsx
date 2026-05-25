/**
 * MessageBubble — randează un singur mesaj din conversație.
 *
 * Mesajele de user sunt aliniate la dreapta cu fundal `primary`; cele de
 * assistant la stânga cu `muted` și markdown render via `react-markdown`.
 * Mesajele de tool nu apar direct (apar implicit ca ToolCallCard sub
 * assistant); dacă apar totuși, randăm un fallback simplu.
 *
 * Markdown e safe by default (react-markdown ≥9 nu acceptă raw HTML);
 * adăugăm remark-gfm pentru tabele/listă-cu-bifă.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";
import { ToolCallCard } from "./ToolCallCard";

interface Props {
  message: ChatMessage;
  /** Live = mesajul curent care încă acumulează tokens (afișează cursor). */
  live?: boolean;
}

export function MessageBubble({ message, live = false }: Props) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {isAssistant ? (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Open links in a new tab so the user doesn't lose chat state
                // when following an external reference. `noopener noreferrer`
                // hardens against `window.opener` tampering and referer leaks.
                a: ({ node: _node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {message.content || (live ? "" : " ")}
            </ReactMarkdown>
            {live && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-current align-middle"
              />
            )}
          </div>
        ) : (
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
        )}
      </div>

      {/* Tool call cards apar imediat sub mesajul assistant. */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex w-full max-w-[85%] flex-col gap-2">
          {message.toolCalls.map((tc, idx) => (
            <ToolCallCard key={`${tc.name}-${idx}`} toolCall={tc} />
          ))}
        </div>
      )}
    </div>
  );
}
