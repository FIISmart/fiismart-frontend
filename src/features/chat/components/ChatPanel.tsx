/**
 * ChatPanel — panoul slide-in din dreapta (Sheet) cu conversația.
 *
 * Două vederi alternative în interior:
 *   - showThreads = false (default) → header cu titlu thread + MessageList + ChatInput;
 *   - showThreads = true            → ThreadList (sidebar) cu thread-urile user-ului.
 *
 * Trecerea între vederi se face cu butonul History din header. Butonul
 * "New" creează implicit un thread nou (de fapt, doar resetează state-ul;
 * thread-ul se materializează pe server abia când se trimite primul mesaj).
 */
import { useState } from "react";
import { History, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useChat } from "../context/ChatContext";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ThreadList } from "./ThreadList";

export function ChatPanel() {
  const { isOpen, setOpen, sessions, activeSessionId, newThread } = useChat();
  const [showThreads, setShowThreads] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const headerTitle = activeSession?.title ?? "Conversație nouă";

  const handleNewThread = async () => {
    await newThread();
    setShowThreads(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md md:max-w-lg"
      >
        <SheetHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 border-b bg-background p-3">
          <SheetTitle className="truncate pr-8 text-base">
            {showThreads ? "Conversațiile mele" : headerTitle}
          </SheetTitle>
          <div className="flex shrink-0 items-center gap-1 pr-6">
            <Button
              variant="ghost"
              size="icon"
              aria-label={showThreads ? "Înapoi la conversație" : "Conversațiile mele"}
              onClick={() => setShowThreads((v) => !v)}
            >
              <History className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Conversație nouă"
              onClick={handleNewThread}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {showThreads ? (
          <ThreadList onSelected={() => setShowThreads(false)} />
        ) : (
          <>
            <MessageList />
            <div className="border-t bg-background p-3">
              <ChatInput />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
