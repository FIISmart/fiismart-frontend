export interface QuizQuestion {
  id: string;
  text: string;
  type?: "multiple_choice" | "written" | string;
  options: string[];
  correctIdx?: number;
  correctText?: string | null;
  points?: number;
  explanation?: string;
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
