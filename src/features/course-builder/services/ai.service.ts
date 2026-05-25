import { postMultipartForm, ssePost } from "@/lib/api";

export type AiQuizQuestionDraft = {
  text: string;
  type: "multiple_choice";
  options: string[];
  correctIdx: number;
  explanation?: string;
};

export type AiQuizDraft = {
  title: string;
  passingScore?: number;
  timeLimit?: number;
  questions: AiQuizQuestionDraft[];
};

export type AiPdfGenerateResponse = {
  summary: string;
  quiz: AiQuizDraft;
};

export type GenerateFromPdfOptions = {
  questionCount?: number;
  language?: "ro" | "en";
  signal?: AbortSignal;
};

/**
 * Calls the backend AI endpoint to generate a markdown summary and a quiz draft
 * from the given PDF. The browser handles the multipart boundary; we attach the
 * standard Bearer token via apiFetch's underlying postMultipartForm helper.
 * Pass `opts.signal` to cancel an in-flight request.
 */
export function generateFromPdf(
  file: File,
  opts?: GenerateFromPdfOptions,
): Promise<AiPdfGenerateResponse> {
  const questionCount = opts?.questionCount ?? 5;
  const language = opts?.language ?? "ro";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("questionCount", String(questionCount));
  formData.append("language", language);

  return postMultipartForm<AiPdfGenerateResponse>(
    "/ai/pdf/generate",
    formData,
    opts?.signal,
  );
}

/**
 * SSE event envelope produced by the streaming PDF endpoint.
 * `token` arrives N times; `done` arrives exactly once on success with
 * the same shape as the non-streaming `generateFromPdf` response.
 * `error` is fatal — caller should stop iterating after it.
 * `ping` is a heartbeat to defeat proxies; safe to ignore.
 */
export type AiPdfStreamEvent =
  | { event: "token"; data: { text: string } }
  | { event: "done"; data: AiPdfGenerateResponse }
  | { event: "error"; data: { message: string } }
  | { event: "ping"; data: unknown };

/**
 * Narrow a raw SSE envelope from `ssePost` into our typed discriminated
 * union. Unknown event names are dropped (returns `null`) and logged in
 * dev so we surface schema drift instead of casting blindly.
 */
function narrowAiPdfStreamEvent(ev: {
  event: string;
  data: unknown;
}): AiPdfStreamEvent | null {
  switch (ev.event) {
    case "token":
    case "done":
    case "error":
    case "ping":
      return ev as AiPdfStreamEvent;
    default:
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("[ai.service] Unknown SSE event:", ev.event);
      }
      return null;
  }
}

/**
 * Streaming variant of `generateFromPdf`. Yields SSE events as Gemini
 * emits tokens, then a final `done` event with the structured summary +
 * quiz. The original `generateFromPdf` remains for backward compat.
 *
 * Pass `opts.signal` to cancel mid-stream; the underlying fetch reader
 * is cancelled and an AbortError propagates to the caller.
 */
export async function* generateFromPdfStream(
  file: File,
  opts?: GenerateFromPdfOptions,
): AsyncIterable<AiPdfStreamEvent> {
  const questionCount = opts?.questionCount ?? 5;
  const language = opts?.language ?? "ro";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("questionCount", String(questionCount));
  formData.append("language", language);

  // Browser sets the multipart boundary automatically when body is FormData
  // — do NOT pass a Content-Type header here.
  for await (const ev of ssePost("/ai/pdf/generate/stream", formData, {
    signal: opts?.signal,
  })) {
    const narrowed = narrowAiPdfStreamEvent(ev);
    if (narrowed) yield narrowed;
  }
}
