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

/** Map a backend CommentResponse to the FE Comment shape. */
export function mapCommentToFE(c: any): Comment {
  const authorId: string = c.authorId || '';
  const validStatus: Comment['status'] =
    c.status === 'rejected' || c.status === 'pending' ? c.status : 'approved';

  return {
    id: c.id,
    userId: authorId,
    // Until the BE exposes a user lookup, render a short label from the id.
    userName: authorId ? `User ${authorId.slice(-6)}` : 'Anonim',
    content: c.body ?? '',
    createdAt: new Date(c.createdAt),
    lessonId: c.lectureId ?? '',
    status: validStatus,
  };
}

export function mapCourseToFE(course: any, _quiz?: any, comments?: any): Course {
  // The backend CourseResponse already includes the modules list — no need for a
  // separate /builder/modules round-trip. Map nested lectures on the spot.
  const modules: Module[] = Array.isArray(course.modules)
    ? course.modules.map((m: any, index: number) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order ?? index,
        quiz: m.quiz ? mapQuizToFE(m.quiz) : undefined,
        lessons: Array.isArray(m.lectures)
          ? m.lectures.map(mapLectureToLesson)
          : [],
      }))
    : [];

  const mappedComments: Comment[] = Array.isArray(comments)
    ? comments.map(mapCommentToFE)
    : [];

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
    modules,
    comments: mappedComments,
    status: course.status as 'draft' | 'published',
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
  };
}

export function mapLectureToLesson(lecture: any): Lesson {
  // BE stores all lesson content in videoUrl regardless of type.
  // Detect the type from the content so PDFs/markdown render correctly after reload.
  const content: string = lecture.videoUrl || '';
  const normalized = content.toLowerCase();

  let detectedType: LessonType = 'video';
  if (normalized.endsWith('.pdf') || normalized.includes('/api/files/')) {
    // GridFS-uploaded files come back as /api/files/{id} with no extension — assume PDF/doc.
    if (normalized.endsWith('.pdf')) detectedType = 'pdf';
    else if (normalized.endsWith('.md') || normalized.endsWith('.markdown')) detectedType = 'markdown';
    else detectedType = 'pdf';
  } else if (normalized.endsWith('.md') || normalized.endsWith('.markdown')) {
    detectedType = 'markdown';
  } else if (content && !content.startsWith('http')) {
    detectedType = 'markdown';
  }

  return {
    id: lecture.id,
    title: lecture.title,
    type: detectedType,
    content,
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