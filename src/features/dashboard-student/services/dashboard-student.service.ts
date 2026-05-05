import { apiFetch } from "@/lib/api";
import type {
  Answer,
  ContinueStudy,
  Recommendation,
  StudentCourse,
  StudentQuiz,
  StudentStats,
} from "../types";

export function getStats(studentId: string) {
  return apiFetch<StudentStats>(`/student-dashboard/${studentId}/stats`);
}

export function getCourses(studentId: string) {
  return apiFetch<StudentCourse[]>(`/student-dashboard/${studentId}/courses`);
}

export function getQuizzes(studentId: string) {
  return apiFetch<StudentQuiz[]>(`/student-dashboard/${studentId}/quizzes`);
}

export function getAnswers(studentId: string) {
  return apiFetch<Answer[]>(`/student-dashboard/${studentId}/answers`);
}

export function getContinue(studentId: string) {
  return apiFetch<ContinueStudy | null>(`/student-dashboard/${studentId}/continue`);
}

export function getRecommendations(studentId: string) {
  return apiFetch<Recommendation | null>(`/student-dashboard/${studentId}/recommendations`);
}
