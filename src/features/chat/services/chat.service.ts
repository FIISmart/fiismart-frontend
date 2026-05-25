/**
 * Wrapper pentru endpoint-urile de chat ale BE-ului.
 *
 * REST CRUD pentru thread-uri (sesiuni) + un generator async care
 * mapează evenimentele SSE crude din `ssePost` la `ChatStreamEvent`-uri
 * tipate (vezi `../types.ts`).
 *
 * `ssePost` este definit în `src/lib/api.ts` (Phase 5) — face POST cu
 * `Accept: text/event-stream`, citește body-ul ca ReadableStream și
 * yield-uiește câte un `{ event, data }` per bloc SSE.
 */
import { apiFetch, ssePost } from "@/lib/api";
import type {
  ChatSession,
  ChatSessionSummary,
  ChatStreamEvent,
  RouteContext,
} from "../types";

export const listSessions = (): Promise<ChatSessionSummary[]> =>
  apiFetch<ChatSessionSummary[]>("/chat/sessions");

export const getSession = (id: string): Promise<ChatSession> =>
  apiFetch<ChatSession>(`/chat/sessions/${id}`);

export const createSession = (): Promise<ChatSession> =>
  apiFetch<ChatSession>("/chat/sessions", { method: "POST" });

export const deleteSession = (id: string): Promise<void> =>
  apiFetch<void>(`/chat/sessions/${id}`, { method: "DELETE" });

export const renameSession = (id: string, title: string): Promise<ChatSession> =>
  apiFetch<ChatSession>(`/chat/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

/**
 * Pornește un stream de mesaje. Yields `ChatStreamEvent`-uri pe măsură ce
 * BE-ul le emite (token / tool_call / tool_result / done / error / ping).
 *
 * Apelantul (vezi `ChatContext.send`) discriminează pe `ev.event` și
 * actualizează state-ul. Evenimentul `done` semnalează finalul; după el
 * BE-ul închide stream-ul natural.
 */
export async function* streamMessage(
  sessionId: string,
  content: string,
  routeContext: RouteContext,
  signal?: AbortSignal,
): AsyncIterable<ChatStreamEvent> {
  const raw = ssePost(
    `/chat/sessions/${sessionId}/messages/stream`,
    JSON.stringify({ content, routeContext }),
    {
      signal,
      headers: { "Content-Type": "application/json" },
    },
  );

  for await (const ev of raw) {
    // Cast controlat: ssePost returnează `{ event: string; data: any }`,
    // dar BE-ul respectă schema din `ChatStreamEvent`. Evenimente
    // necunoscute sunt yielded ca atare — apelantul le ignoră via
    // `default` în switch.
    yield ev as ChatStreamEvent;
  }
}
