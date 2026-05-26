/**
 * ChatContext — state machine pentru chatbot-ul FIISmart.
 *
 * Responsabilități:
 *  - menține lista de thread-uri (sidebar) și mesajele active;
 *  - rulează stream-ul SSE de mesaje (token / tool_call / tool_result / done / error);
 *  - expune acțiuni (`open`, `send`, `newThread`, `selectThread`, `deleteThread`, `renameThread`).
 *
 * Flux de trimitere (vezi `send`):
 *   1. dacă nu există sesiune activă, cere una de la BE (`createSession`);
 *   2. apendăm mesajul user-ului optimist + setăm `isStreaming`;
 *   3. consumăm `streamMessage(...)`, acumulăm `streamingContent`,
 *      tracking pentru `pendingToolCalls`;
 *   4. la `done` comităm un singur mesaj assistant (cu tool calls atașate);
 *   5. la `error` păstrăm user message-ul și setăm `error` ca să poată
 *      ataca retry.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  renameSession,
  streamMessage,
} from "../services/chat.service";
import type {
  ChatMessage,
  ChatSessionSummary,
  RouteContext,
  ToolCall,
} from "../types";
import { useRouteContext } from "../hooks/useRouteContext";

interface ChatContextValue {
  isOpen: boolean;
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  activeMessages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  pendingToolCalls: ToolCall[];
  error: string | null;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  send: (content: string) => Promise<void>;
  newThread: () => Promise<void>;
  selectThread: (id: string) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  renameThread: (id: string, title: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const now = () => new Date().toISOString();

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingToolCalls, setPendingToolCalls] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reținem cel mai recent routeContext într-un ref ca să-l putem citi
  // din interiorul lui `send` fără să forțăm reconstrucția callback-ului.
  const routeContext: RouteContext = useRouteContext();
  const routeContextRef = useRef(routeContext);
  useEffect(() => {
    routeContextRef.current = routeContext;
  }, [routeContext]);

  // Abort controller-ul stream-ului curent, ca să putem opri trimiterea
  // anterioară dacă utilizatorul navighează între thread-uri sau închide
  // panoul în timp ce un mesaj e în flight.
  const abortRef = useRef<AbortController | null>(null);

  // Încărcăm lista de thread-uri la prima deschidere a panoului.
  const ensureSessionsLoaded = useCallback(async () => {
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      // Sidebar gol e un fail mode acceptabil — nu spamăm user-ul.
      // eslint-disable-next-line no-console
      console.warn("[chat] failed to list sessions", e);
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    void ensureSessionsLoaded();
  }, [ensureSessionsLoaded]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setOpen = useCallback(
    (v: boolean) => {
      if (v) open();
      else close();
    },
    [open, close],
  );

  const clearError = useCallback(() => setError(null), []);

  const newThread = useCallback(async () => {
    // Anulează orice stream în desfășurare pentru thread-ul anterior.
    abortRef.current?.abort();
    setActiveSessionId(null);
    setActiveMessages([]);
    setStreamingContent("");
    setPendingToolCalls([]);
    setError(null);
  }, []);

  const selectThread = useCallback(async (id: string) => {
    abortRef.current?.abort();
    setError(null);
    setStreamingContent("");
    setPendingToolCalls([]);
    try {
      const session = await getSession(id);
      setActiveSessionId(session.id);
      setActiveMessages(session.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca conversația.");
    }
  }, []);

  const deleteThread = useCallback(
    async (id: string) => {
      try {
        await deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(null);
          setActiveMessages([]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nu am putut șterge conversația.");
      }
    },
    [activeSessionId],
  );

  const renameThread = useCallback(async (id: string, title: string) => {
    try {
      const updated = await renameSession(id, title);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, title: updated.title, updatedAt: updated.updatedAt } : s,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut redenumi conversația.");
    }
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setError(null);

      // 1) Sesiunea activă (creează una dacă nu există).
      let sessionId = activeSessionId;
      if (!sessionId) {
        try {
          const created = await createSession();
          sessionId = created.id;
          setActiveSessionId(created.id);
          // Insert în sidebar la început.
          setSessions((prev) => [
            { id: created.id, title: created.title, updatedAt: created.updatedAt },
            ...prev.filter((s) => s.id !== created.id),
          ]);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Nu am putut crea conversația.");
          return;
        }
      }

      // 2) User message optimist.
      const userMessage: ChatMessage = { role: "user", content: trimmed, ts: now() };
      setActiveMessages((prev) => [...prev, userMessage]);

      // 3) Pregătim stream-ul.
      setIsStreaming(true);
      setStreamingContent("");
      setPendingToolCalls([]);
      const controller = new AbortController();
      abortRef.current = controller;

      // Accumulator-i locali — ca să putem comite mesajul în handler-ul `done`
      // fără să depindem de propagarea setState-ului (React 19 batchează).
      let accumulatedContent = "";
      let accumulatedToolCalls: ToolCall[] = [];

      try {
        for await (const ev of streamMessage(
          sessionId,
          trimmed,
          routeContextRef.current,
          controller.signal,
        )) {
          if (ev.event === "token") {
            accumulatedContent += ev.data?.text ?? "";
            setStreamingContent(accumulatedContent);
          } else if (ev.event === "tool_call") {
            const call: ToolCall = { name: ev.data.name, args: ev.data.args };
            accumulatedToolCalls = [...accumulatedToolCalls, call];
            setPendingToolCalls(accumulatedToolCalls);
          } else if (ev.event === "tool_progress") {
            // Atașăm evenimentul de progres pe ultimul tool call în desfășurare
            // (cel cu același `name` și fără `result` încă). Iterăm din coadă
            // ca să găsim cel mai recent match și recompunem array-ul fără
            // mutare in-place (ca să re-renderează React).
            let attached = false;
            const next: ToolCall[] = new Array(accumulatedToolCalls.length);
            for (let i = accumulatedToolCalls.length - 1; i >= 0; i--) {
              const tc = accumulatedToolCalls[i];
              if (!attached && tc.name === ev.data.name && tc.result === undefined) {
                const entry = {
                  step: ev.data.step,
                  total: ev.data.total,
                  message: ev.data.message,
                  ts: now(),
                };
                const updatedProgress = [...(tc.progress ?? []), entry];
                // Cap la 100 entries ca să evităm growth nemărginit pe un
                // tool care emite în buclă.
                const capped =
                  updatedProgress.length > 100
                    ? updatedProgress.slice(-100)
                    : updatedProgress;
                next[i] = { ...tc, progress: capped };
                attached = true;
              } else {
                next[i] = tc;
              }
            }
            if (attached) {
              accumulatedToolCalls = next;
              setPendingToolCalls(accumulatedToolCalls);
            } else if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.warn(
                "[chat] tool_progress without a pending tool call:",
                ev.data,
              );
            }
          } else if (ev.event === "tool_result") {
            accumulatedToolCalls = accumulatedToolCalls.map((tc) =>
              tc.name === ev.data.name && tc.result === undefined
                ? { ...tc, result: ev.data.result }
                : tc,
            );
            setPendingToolCalls(accumulatedToolCalls);
          } else if (ev.event === "done") {
            const finalMsg: ChatMessage = {
              id: ev.data.messageId,
              role: "assistant",
              content: accumulatedContent,
              toolCalls: accumulatedToolCalls.length > 0 ? accumulatedToolCalls : undefined,
              ts: now(),
            };
            setActiveMessages((prev) => [...prev, finalMsg]);
            // Clear pending tool calls in the same React batch as the message
            // append. Without this, there is a render between "message
            // committed" and the `finally` cleanup where the assistant message
            // (which already carries the tool calls) AND the standalone pending
            // cards both exist — the UI briefly shows duplicates. The `finally`
            // block becomes idempotent.
            setPendingToolCalls([]);
            // Bring the thread to the top of the sidebar + update title.
            setSessions((prev) => {
              const others = prev.filter((s) => s.id !== ev.data.sessionId);
              return [
                {
                  id: ev.data.sessionId,
                  title: ev.data.title,
                  updatedAt: now(),
                },
                ...others,
              ];
            });
          } else if (ev.event === "error") {
            setError(ev.data?.message ?? "Eroare la generare.");
          }
          // `ping` events: deliberate no-op.
        }
      } catch (e) {
        // AbortError = utilizator a navigat / a închis; nu e o eroare reală.
        if ((e as { name?: string })?.name !== "AbortError") {
          setError(
            e instanceof Error ? e.message : "Conexiunea cu serverul s-a întrerupt.",
          );
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        setPendingToolCalls([]);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [activeSessionId, isStreaming],
  );

  // Cleanup la unmount: oprește orice stream în desfășurare.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      isOpen,
      sessions,
      activeSessionId,
      activeMessages,
      isStreaming,
      streamingContent,
      pendingToolCalls,
      error,
      open,
      close,
      setOpen,
      send,
      newThread,
      selectThread,
      deleteThread,
      renameThread,
      clearError,
    }),
    [
      isOpen,
      sessions,
      activeSessionId,
      activeMessages,
      isStreaming,
      streamingContent,
      pendingToolCalls,
      error,
      open,
      close,
      setOpen,
      send,
      newThread,
      selectThread,
      deleteThread,
      renameThread,
      clearError,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
