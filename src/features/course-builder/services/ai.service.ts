import { postMultipartForm } from "@/lib/api";

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
};

/**
 * Calls the backend AI endpoint to generate a markdown summary and a quiz draft
 * from the given PDF. The browser handles the multipart boundary; we attach the
 * standard Bearer token via apiFetch's underlying postMultipartForm helper.
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

  return postMultipartForm<AiPdfGenerateResponse>("/ai/pdf/generate", formData);
}
