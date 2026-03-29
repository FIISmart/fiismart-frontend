export type LessonType = 'video' | 'pdf' | 'markdown';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video/pdf, markdown content for markdown
  duration?: number; // in minutes (FE display) — converted from durationSecs
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
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
  lessons: Lesson[];
  quiz?: Quiz;
  comments: Comment[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  totalDuration?: number;
  totalLessons?: number;
}

export const generateId = () => Math.random().toString(36).substring(2, 15);

// ── Mappers: API → FE types ───────────────────────────

import type { CourseAPI, LectureAPI, QuizAPI, CommentAPI } from './api';

export function mapLectureToLesson(lecture: LectureAPI): Lesson {
  return {
    id: lecture.id,
    title: lecture.title,
    type: 'video', // BE only stores videoUrl, default to video
    content: lecture.videoUrl || '',
    duration: lecture.durationSecs ? Math.round(lecture.durationSecs / 60) : undefined,
    order: lecture.order,
  };
}

export function mapQuizToFE(quiz: QuizAPI): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    shuffleQuestions: quiz.shuffleQuestions,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.text,
      options: q.options,
      correctAnswer: q.correctIdx,
      explanation: q.explanation || undefined,
    })),
  };
}

export function mapCommentToFE(comment: CommentAPI): Comment {
  return {
    id: comment.id,
    userId: comment.authorId,
    userName: comment.authorId, // TODO: resolve user name from authorId
    content: comment.body,
    createdAt: new Date(comment.createdAt),
    lessonId: comment.lectureId || '',
    status: comment.isDeleted ? 'rejected' : comment.flagCount > 0 ? 'pending' : 'approved',
  };
}

export function mapCourseToFE(course: CourseAPI, quiz?: QuizAPI | null, comments?: CommentAPI[]): Course {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnailUrl || undefined,
    tags: course.tags || [],
    instructor: {
      id: course.teacherId,
      name: 'Profesor', // TODO: resolve from user API
    },
    lessons: course.lectures.map(mapLectureToLesson),
    quiz: quiz ? mapQuizToFE(quiz) : undefined,
    comments: comments ? comments.map(mapCommentToFE) : [],
    status: course.status as 'draft' | 'published',
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
  };
}
