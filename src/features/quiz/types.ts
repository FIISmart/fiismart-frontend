export interface QuizQuestion {
  id: string;
  text: string;
  type?: "multiple_choice" | "written" | "free_text" | string;
  options: string[];
  correctIdx?: number;
  correctText?: string | null;
  points?: number;
  explanation?: string;
  // Free-text (AI-graded) fields. Surfaced to the player so it can render
  // the textarea + AI-grading note, and to the result page so it can show
  // missing concepts in context.
  sampleAnswer?: string;
  keyConcepts?: string[];
  passThreshold?: number;
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

export interface QuizAttemptAnswer {
  questionId: string;
  selectedIdx: number;
  writtenAnswer?: string;
  correct: boolean;
  // AI-grading fields, populated by the BE for free_text questions.
  // `aiScore` may be null when grading failed entirely; downstream UI must
  // treat null as "unavailable" rather than "0".
  aiScore?: number | null;
  aiConfidence?: number;
  aiReasoning?: string;
  aiMissingConcepts?: string[];
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
