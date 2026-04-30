export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}
