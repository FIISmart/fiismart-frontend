/**
 * Student-facing quiz question. Intentionally omits the answer-key fields
 * (`correctIdx`, `correctText`, `explanation`) that the course-builder uses —
 * the BE strips those from `GET /student-quizzes/:id` so the answer key never
 * reaches the student client. For the editor type that DOES carry those
 * fields, see `@/lib/course-types`.
 */
export interface QuizQuestion {
  id: string;
  text: string;
  type?: "multiple_choice" | "written" | string;
  options: string[];
  points?: number;
}

export interface Quiz {
  id: string;
  courseId?: string;
  moduleId?: string | null;
  lectureId?: string | null;
  quizScope?: "lecture" | "module" | "course_final" | string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions: QuizQuestion[];
}

/**
 * One submitted answer in a quiz attempt. `correct` is stamped by the BE
 * after grading — the client must NOT send it; if present in a POST body
 * the server ignores it.
 */
export interface QuizAttemptAnswer {
  questionId: string;
  selectedIdx: number;
  writtenAnswer?: string;
  correct?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  studentId: string;
  attemptedAt: string;
  score: number;
  passed: boolean;
  timeTakenSecs: number;
  answers: QuizAttemptAnswer[];
}
