import { apiFetch } from "@/lib/api";
import type { Quiz, QuizAttempt, QuizAttemptAnswer } from "../types";

type QuizApiQuestion = {
  id?: string;
  text?: string;
  type?: string;
  points?: number;
  options?: string[];
  correctIdx?: number | null;
  correctText?: string | null;
  explanation?: string | null;
  // Free-text (AI-graded) fields. Optional — only present when type === 'free_text'.
  sampleAnswer?: string | null;
  keyConcepts?: string[] | null;
  passThreshold?: number | null;
};

type QuizApiResponse = {
  id: string;
  courseId?: string;
  moduleId?: string | null;
  lectureId?: string | null;
  quizScope?: string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions?: QuizApiQuestion[];
};

function mapQuiz(data: QuizApiResponse): Quiz {
  return {
    id: data.id,
    courseId: data.courseId,
    moduleId: data.moduleId,
    lectureId: data.lectureId,
    quizScope: data.quizScope,
    title: data.title,
    passingScore: data.passingScore,
    timeLimit: data.timeLimit,
    shuffleQuestions: data.shuffleQuestions,
    questions: (data.questions ?? []).map((question, index) => {
      const normalizedType: "multiple_choice" | "written" | "free_text" =
        question.type === "free_text"
          ? "free_text"
          : question.type === "written"
            ? "written"
            : "multiple_choice";
      return {
        id: question.id ?? `question-${index}`,
        text: question.text ?? "",
        type: normalizedType,
        options: question.options ?? [],
        correctIdx: question.correctIdx ?? undefined,
        correctText: question.correctText,
        points: question.points,
        explanation: question.explanation ?? undefined,
        sampleAnswer: question.sampleAnswer ?? undefined,
        keyConcepts: Array.isArray(question.keyConcepts) ? question.keyConcepts : undefined,
        passThreshold:
          typeof question.passThreshold === "number" ? question.passThreshold : undefined,
      };
    }),
  };
}

/** Fetches a single quiz by id. */
export function getQuiz(quizId: string): Promise<Quiz> {
  return apiFetch<QuizApiResponse>(`/student-quizzes/${quizId}`).then(mapQuiz);
}

export function createQuizAttempt(payload: {
  quizId: string;
  courseId: string;
  studentId: string;
  score: number;
  passed: boolean;
  timeTakenSecs: number;
  answers: QuizAttemptAnswer[];
}): Promise<QuizAttempt> {
  return apiFetch<QuizAttempt>("/quiz-attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLatestQuizAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null> {
  return apiFetch<QuizAttempt>(`/quiz-attempts/student/${studentId}/quiz/${quizId}/latest`)
    .catch(() => null);
}

