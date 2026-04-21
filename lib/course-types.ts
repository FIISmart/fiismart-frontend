//
export type LessonType = 'video' | 'pdf' | 'markdown';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; 
  duration?: number;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'written'; 
  options?: string[]; 
  correctAnswer: number | string; 
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions: QuizQuestion[];
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
    avatar?: string;
  };
  modules: Module[]; 
  comments: Comment[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export const generateId = () => Math.random().toString(36).substring(2, 15);

export function mapCourseToFE(course: any, quiz?: any, comments?: any): Course {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnailUrl || undefined,
    tags: course.tags || [],
    instructor: {
      id: course.teacherId,
      name: 'Profesor',
    },
    modules: [], // Populated by separate API call
    comments: comments || [],
    status: course.status as 'draft' | 'published',
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
  };
}

export function mapLectureToLesson(lecture: any): Lesson {
  return {
    id: lecture.id,
    title: lecture.title,
    type: 'video', 
    content: lecture.videoUrl || '',
    duration: lecture.durationSecs ? Math.round(lecture.durationSecs / 60) : undefined,
    order: lecture.order,
  };
}

export function mapQuizToFE(quiz: any): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q: any) => ({
      id: q.id,
      question: q.text,
      type: q.type || 'multiple_choice',
      options: q.options || [],
      correctAnswer: q.type === 'written' ? (q.correctText || "") : (q.correctIdx || 0),
      explanation: q.explanation,
    })),
  };
}