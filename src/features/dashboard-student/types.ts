/**
 * Type definitions for the student dashboard feature.
 *
 * These shapes match the responses returned by the backend dashboard
 * endpoints under `/api/dashboard/{studentId}/...`.
 */

export interface StudentStats {
  firstName?: string;
  lastName?: string;
  name?: string;
  enrolledCourses: number;
  activeCourses: number;
  quizzesCompleted: number;
  streakDays: number;
}

export interface StudentCourse {
  title: string;
  overallProgress: number;
  enrollmentCount: number;
  avgRating: number;
}

export interface StudentQuiz {
  titluQuiz: string;
  numeCurs: string;
  incercari: number;
  scor: number;
  status: string;
}

export interface Answer {
  autorRaspuns: string;
  intrebare: string;
  raspuns: string;
}

export interface Recommendation {
  title: string;
  description: string;
  courseId?: string;
}

export interface ContinueStudy {
  titluCurs: string;
  cursId?: string;
}
