/**
 * Tipuri pentru feature-ul de chat (Phase 6 — Chatbot UI).
 *
 * Aliniat la contractul BE din Phase 2/3 al planului:
 *  - REST endpoints: GET/POST /chat/sessions, GET/DELETE/PATCH /chat/sessions/{id}
 *  - SSE endpoint:   POST /chat/sessions/{id}/messages/stream
 *
 * Evenimentele SSE sunt o uniune discriminată — formatul `event:` din
 * cadrul fluxului SSE devine tag-ul de tip aici, iar `data:` este payload-ul
 * JSON deja parsat de `ssePost` (vezi src/lib/api.ts).
 */

export type ToolName = "createQuizDraft" | "createCourseDraft";

export interface ToolCall {
  name: ToolName;
  args: Record<string, any>;
  /** Populat după ce BE-ul rulează handler-ul. Lipsește în timpul `tool_call`. */
  result?: any;
}

export interface ChatMessage {
  /** Server-assigned ID — lipsește pentru mesaje optimist locale. */
  id?: string;
  role: "user" | "assistant" | "tool";
  content: string;
  /** Tool calls invocate de assistant în cadrul acestui mesaj (dacă există). */
  toolCalls?: ToolCall[];
  /** ISO timestamp. */
  ts: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  createdAt: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface RouteContext {
  /** Free-form route label (lecture-view, course-builder, quiz-player, etc). */
  route: string;
  lectureId?: string;
  courseId?: string;
  quizId?: string;
}

/**
 * Evenimentele pe care FE-ul le poate primi de la endpoint-ul SSE de chat.
 * `ping` apare ocazional ca heartbeat — îl ignorăm în UI.
 */
export type ChatStreamEvent =
  | { event: "token"; data: { text: string } }
  | { event: "tool_call"; data: { name: ToolName; args: Record<string, any> } }
  | { event: "tool_result"; data: { name: ToolName; result: any } }
  | { event: "done"; data: { messageId: string; sessionId: string; title: string } }
  | { event: "error"; data: { message: string } }
  | { event: "ping"; data: any };
