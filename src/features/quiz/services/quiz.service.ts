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
    questions: (data.questions ?? []).map((question, index) => ({
      id: question.id ?? `question-${index}`,
      text: question.text ?? "",
      type: question.type === "written" ? "written" : "multiple_choice",
      options: question.options ?? [],
      points: question.points,
      // Intentionally do NOT map correctIdx / correctText / explanation —
      // those are answer-key fields that the student client must not see
      // before submitting. The BE strips them on /student-quizzes/:id; we
      // double-up the guarantee here so a BE regression can't leak them
      // into the in-memory Quiz object that React state stores.
    })),
  };
}

/** Fetches a single quiz by id. */
export function getQuiz(quizId: string): Promise<Quiz> {
  return apiFetch<QuizApiResponse>(`/student-quizzes/${quizId}`).then(mapQuiz);
}

/**
 * Submit a quiz attempt. The client sends only the question/answer pairs;
 * the BE computes `score` and `passed` server-side and returns them on the
 * response. The client must NOT send `score`/`passed`/`correct` — the BE
 * ignores them and would silently accept a falsified passing score if we
 * still passed them (the previous client-trusted-score bug).
 */
export function createQuizAttempt(payload: {
  quizId: string;
  courseId: string;
  timeTakenSecs: number;
  answers: Omit<QuizAttemptAnswer, "correct">[];
}): Promise<QuizAttempt> {
  return apiFetch<QuizAttempt>("/quiz-attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch the calling student's latest attempt on this quiz. The BE derives the
 * student id from the authenticated principal — no need to pass studentId.
 */
export function getLatestQuizAttempt(quizId: string): Promise<QuizAttempt | null> {
  return apiFetch<QuizAttempt>(`/quiz-attempts/student/me/quiz/${quizId}/latest`)
    .catch(() => null);
}

