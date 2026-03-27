export type LessonType = 'video' | 'pdf' | 'markdown';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video/pdf, markdown content for markdown
  duration?: number; // in minutes
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  quiz?: Quiz;
  order: number;
  isExpanded?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  lessonId: string;
  status: 'pending' | 'approved' | 'rejected';
  replies?: Comment[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  instructor: {
    id: string;
    name: string;
    title?: string;
    avatar?: string;
  };
  modules: Module[];
  comments: Comment[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  totalDuration?: number;
  totalLessons?: number;
}

export const generateId = () => Math.random().toString(36).substring(2, 15);
