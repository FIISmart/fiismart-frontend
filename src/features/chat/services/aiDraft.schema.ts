/**
 * Runtime schemas for AI-generated draft payloads delivered via chat tool
 * calls. The chatbot forwards these payloads to the course/quiz pages as
 * `location.state.aiDraft.payload`, but the payload originates from the
 * model — we cannot trust the shape, so we validate it with zod before
 * opening any editor. Invalid payloads are dropped (toast + clear state)
 * to avoid crashing the editors with malformed input.
 */
import { z } from "zod";

/**
 * Question shape mirrors the BE DTO for `createQuizDraft.result.questions`.
 * `type` is constrained to the two supported values; `multiple_choice`
 * needs `options` + `correctIdx`, `free_text` needs the AI grading fields.
 * Optional fields are tolerated as missing — pickup code falls back to
 * sensible defaults.
 */
export const aiQuizQuestionDraftSchema = z.object({
  text: z.string(),
  type: z.union([z.literal("multiple_choice"), z.literal("free_text")]),
  options: z.array(z.string()).optional(),
  correctIdx: z.number().int().optional(),
  correctText: z.string().optional(),
  explanation: z.string().optional(),
  sampleAnswer: z.string().optional(),
  keyConcepts: z.array(z.string()).optional(),
  passThreshold: z.number().optional(),
});

export const aiQuizDraftSchema = z.object({
  title: z.string(),
  passingScore: z.number().optional(),
  timeLimit: z.number().optional(),
  questions: z.array(aiQuizQuestionDraftSchema),
});

export const aiCourseModuleDraftSchema = z.object({
  title: z.string(),
  lectureTitles: z.array(z.string()).optional(),
});

export const aiCourseDraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  modules: z.array(aiCourseModuleDraftSchema).optional(),
});

export type AiQuizDraftPayload = z.infer<typeof aiQuizDraftSchema>;
export type AiCourseDraftPayload = z.infer<typeof aiCourseDraftSchema>;

/**
 * Result payload pentru tool-ul `buildFullCourse` (Phase 6). BE-ul
 * persistă cursul + modulele + lecțiile + quiz-urile direct în DB și
 * returnează doar identificatorii + numere de sumar — FE-ul folosește
 * `courseId` pentru CTA-ul "Vezi cursul".
 */
export const buildFullCourseResultSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  moduleCount: z.number().int(),
  lectureCount: z.number().int(),
  quizCount: z.number().int(),
});

export type BuildFullCourseResult = z.infer<typeof buildFullCourseResultSchema>;
