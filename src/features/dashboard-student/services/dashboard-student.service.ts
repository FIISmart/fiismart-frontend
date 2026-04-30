import { apiFetch } from "@/lib/api";
import type {
  Answer,
  ContinueStudy,
  Recommendation,
  StudentCourse,
  StudentQuiz,
  StudentStats,
} from "../types";

/**
 * Thin wrappers around the backend dashboard endpoints. Each call funnels
 * through the shared `apiFetch` primitive so error handling, base URL
 * resolution, and JSON parsing stay consistent across features.
 */

export function getStats(studentId: string) {
  return apiFetch<StudentStats>(`/dashboard/${studentId}/stats`);
}

export function getCourses(studentId: string) {
  return apiFetch<StudentCourse[]>(`/dashboard/${studentId}/courses`);
}

export function getQuizzes(studentId: string) {
  return apiFetch<StudentQuiz[]>(`/dashboard/${studentId}/quizzes`);
}

export function getAnswers(studentId: string) {
  return apiFetch<Answer[]>(`/dashboard/${studentId}/answers`);
}

export function getContinue(studentId: string) {
  return apiFetch<ContinueStudy | null>(`/dashboard/${studentId}/continue`);
}

export function getRecommendations(studentId: string) {
  return apiFetch<Recommendation | null>(`/dashboard/${studentId}/recommendations`);
}
