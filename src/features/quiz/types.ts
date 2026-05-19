export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}
