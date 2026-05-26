import type { Quiz, QuizQuestion } from "@/lib/course-types";
import { generateId } from "@/lib/course-types";
import type { AiQuizDraft, AiQuizQuestionDraft } from "./ai.service";

function mapDraftQuestion(draft: AiQuizQuestionDraft): QuizQuestion {
  return {
    id: generateId(),
    question: draft.text,
    type: "multiple_choice",
    options: draft.options,
    correctAnswer: draft.correctIdx,
    explanation: draft.explanation,
  };
}

/**
 * Convert an AI-generated quiz draft into the FE Quiz shape used by the course
 * builder. Note FE uses `question` (not `text`) and `correctAnswer` (not
 * `correctIdx`); this mapper bridges those naming differences.
 */
export function aiDraftToFeQuiz(draft: AiQuizDraft, fallbackTitle: string): Quiz {
  return {
    id: generateId(),
    title: draft.title || fallbackTitle,
    passingScore: draft.passingScore ?? 70,
    timeLimit: draft.timeLimit ?? 30,
    shuffleQuestions: false,
    questions: draft.questions.map(mapDraftQuestion),
  };
}
