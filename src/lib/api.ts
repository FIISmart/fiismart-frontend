export const API_BASE = import.meta.env.VITE_API_URL || "/api";

/** Eroare aruncată de apiFetch pentru răspunsuri non-2xx. Poartă și codul din JSON. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** localStorage key for the bearer token. Mirrored from features/auth/services/auth.service.ts. */
const TOKEN_KEY = "fiismart_token";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    let errMessage: string = err.message || `Request failed: ${res.status}`;
    if (errMessage === "Validation failed" && err.errors) {
      const firstMessages = Object.values(err.errors as Record<string, string[]>).flat();
      if (firstMessages.length > 0) errMessage = firstMessages[0];
    }
    throw new ApiError(errMessage, res.status, err.code);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const request = apiFetch;

// ── Interfaces ──────────────────────────────────────────

export interface ModuleResponse {
  id: string;
  title: string;
  description: string;
  order: number;
  quizId?: string | null;
  lectures: LectureAPI[];
}

export interface CourseAPI {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  status: string;
  tags: string[];
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Backend now uses Modules
  modules?: ModuleResponse[]; 
}

export interface LectureAPI {
  id: string;
  title: string;
  type?: string | null;
  content?: string | null;
  videoUrl: string | null;
  pdfUrl?: string | null;
  order: number;
  durationSecs: number;
}

export interface QuizAPI {
  id: string;
  courseId: string;
  moduleId?: string | null;
  lectureId?: string | null;
  quizScope?: string;
  title: string;
  passingScore: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  questions: QuizQuestionAPI[];
}

export interface QuizQuestionAPI {
  id: string;
  text: string;
  type: 'multiple_choice' | 'written'; // Updated for your request
  options: string[];
  correctIdx?: number;     // Used for grila
  correctText?: string;    // Used for written responses
  explanation: string | null;
}

export interface ModuleQuizAPI {
  id: string;
  courseId: string;
  moduleId?: string | null;
  lectureId?: string | null;
  quizScope: "lecture" | "module" | "course_final" | string;
  title: string;
  passingScore: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  questions: ModuleQuizQuestionAPI[];
}

export interface ModuleQuizQuestionAPI {
  id: string;
  text: string;
  imageUrl?: string | null;
  type: string;
  points: number;
  options: string[];
  correctIdx: number;
  correctText?: string | null;
  explanation: string | null;
}

// ── Course & Module Endpoints ───────────────────────────

export function getModules(courseId: string) {
  return request<ModuleResponse[]>(`/courses/${courseId}/builder/modules`);
}

export function addModule(courseId: string, data: { title: string; description?: string }) {
  return request<ModuleResponse>(`/courses/${courseId}/builder/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateModule(courseId: string, moduleId: string, data: { title: string; description?: string }) {
  return request<ModuleResponse>(`/courses/${courseId}/builder/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteModule(courseId: string, moduleId: string) {
  return request<void>(`/courses/${courseId}/builder/modules/${moduleId}`, {
    method: "DELETE",
  });
}

// ── Lecture Endpoints (Nested in Modules) ───────────────

export function addLectureToModule(
  courseId: string, 
  moduleId: string, 
  data: { title: string; type?: string; content?: string; videoUrl?: string; pdfUrl?: string; order: number; durationSecs: number }
) {
  return request<LectureAPI>(`/courses/${courseId}/builder/modules/${moduleId}/lectures`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLectureInModule(
  courseId: string,
  moduleId: string,
  lectureId: string,
  data: Partial<LectureAPI>
) {
  return request<LectureAPI>(`/courses/${courseId}/builder/modules/${moduleId}/lectures/${lectureId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteLectureFromModule(courseId: string, moduleId: string, lectureId: string) {
  return request<void>(`/courses/${courseId}/builder/modules/${moduleId}/lectures/${lectureId}`, {
    method: "DELETE",
  });
}
export interface CommentAPI {
  id: string;
  lectureId: string | null;
  courseId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  parentCommentId: string | null;
  likeCount: number;
  flagCount: number;
}

export function getCoursesByTeacher(teacherId: string) {
  return request<CourseAPI[]>(`/courses?teacherId=${teacherId}`);
}

export function getPublishedCourses() {
  return request<CourseAPI[]>(`/courses?published=true`);
}

export function createCourse(data: { title: string; description: string; teacherId: string; tags?: string[] }) {
  return request<CourseAPI>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteCourse(courseId: string) {
  return request<void>(`/courses/${courseId}`, {
    method: "DELETE",
  });
}

export function getComments(courseId: string) {
  return request<CommentAPI[]>(`/courses/${courseId}/comments`);
}

export function updateCourse(
  courseId: string,
  data: Partial<Pick<CourseAPI, "title" | "description" | "tags" | "thumbnailUrl" | "status">>
) {
  return request<CourseAPI>(`/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function draftCourse(courseId: string) {
  return request<CourseAPI>(`/courses/${courseId}/draft`, { method: "PATCH" });
}

export function updateCommentStatus(commentId: string, status: string) {
  return request<void>(`/comments/${commentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteComment(commentId: string) {
  return request<void>(`/comments/${commentId}`, { method: "DELETE" });
}

// mapLectureToLesson lives in lib/course-types.ts — it does type detection
// based on the content shape (PDF/markdown/video). Re-export here for
// any caller who imports from `@/lib/api`.
export { mapLectureToLesson } from "./course-types";

// ── Quiz Endpoints ──────────────────────────────────────

export interface QuizQuestionPayload {
  text: string;
  type: string;
  options: string[];
  correctIdx?: number;
  correctText?: string; // written responses
  explanation?: string;
}

export interface QuizPayload {
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions: QuizQuestionPayload[];
}

export interface ModuleQuizQuestionPayload {
  text: string;
  imageUrl?: string;
  type?: string;
  points?: number;
  options: string[];
  correctIdx: number;
  correctText?: string | null;
  explanation?: string;
}

export interface ModuleQuizPayload {
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions: ModuleQuizQuestionPayload[];
}

// Legacy course-wide quiz (kept for backwards compat, not used by the builder UI).
export function getQuiz(courseId: string) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`);
}
export function deleteQuiz(courseId: string) {
  return request<void>(`/courses/${courseId}/quiz`, { method: "DELETE" });
}
export function createOrUpdateQuiz(courseId: string, data: QuizPayload) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Module-scoped quiz (used by the course builder) ─────

export function getCourseBuilderQuizzes(courseId: string) {
  return request<ModuleQuizAPI[]>(`/courses/${courseId}/builder/quizzes`);
}

export function getModuleQuiz(courseId: string, moduleId: string) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/modules/${moduleId}/quiz`);
}

export function createOrUpdateModuleQuiz(
  courseId: string,
  moduleId: string,
  data: ModuleQuizPayload
) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/modules/${moduleId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function addQuizQuestion(courseId: string, data: QuizQuestionPayload) {
  return request<QuizQuestionAPI>(`/courses/${courseId}/quiz/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteModuleQuiz(courseId: string, moduleId: string) {
  return request<void>(`/courses/${courseId}/builder/modules/${moduleId}/quiz`, {
    method: "DELETE",
  });
}

// ── Lecture-scoped quiz (used by the course builder) ────

export function getLectureQuiz(courseId: string, moduleId: string, lectureId: string) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/modules/${moduleId}/lectures/${lectureId}/quiz`);
}

export function createOrUpdateLectureQuiz(
  courseId: string,
  moduleId: string,
  lectureId: string,
  data: ModuleQuizPayload
) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/modules/${moduleId}/lectures/${lectureId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteLectureQuiz(courseId: string, moduleId: string, lectureId: string) {
  return request<void>(`/courses/${courseId}/builder/modules/${moduleId}/lectures/${lectureId}/quiz`, {
    method: "DELETE",
  });
}

// ── Course-final-scoped quiz (used by the course builder) ─

export function getCourseFinalQuiz(courseId: string) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/final-quiz`);
}

export function createOrUpdateCourseFinalQuiz(courseId: string, data: ModuleQuizPayload) {
  return request<ModuleQuizAPI>(`/courses/${courseId}/builder/final-quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteCourseFinalQuiz(courseId: string) {
  return request<void>(`/courses/${courseId}/builder/final-quiz`, {
    method: "DELETE",
  });
}

// ── File Upload Helpers ─────────────────────────────────

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

async function postMultipart(path: string, file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return postMultipartForm<UploadResponse>(path, formData);
}

/**
 * POST a pre-built FormData to `path`. The browser sets the multipart
 * boundary automatically (do NOT set Content-Type). Bearer auth is attached.
 * Pass `signal` to support cancellation (e.g. user closing the dialog
 * mid-upload). On abort, fetch throws an AbortError that callers can
 * detect via `err.name === "AbortError"`.
 */
export async function postMultipartForm<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...authHeader() },
    body: formData,
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    let errMessage: string = err.message || `Upload failed: ${res.status}`;
    if (errMessage === "Validation failed" && err.errors) {
      const firstMessages = Object.values(err.errors as Record<string, string[]>).flat();
      if (firstMessages.length > 0) errMessage = firstMessages[0];
    }
    throw new ApiError(errMessage, res.status, err.code);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Upload a cover image for a course (JPG/PNG/WebP/GIF, max 5MB). */
export function uploadThumbnail(file: File) {
  return postMultipart("/files/thumbnail", file);
}

/**
 * Fetches a previously uploaded file (from /api/v1/files/{id} or similar)
 * and wraps it as a browser `File` so it can be replayed through any
 * multipart-upload code path. `urlOrPath` may be a path-only URL (the form
 * the BE stores: "/api/v1/files/abc..."); we forward it untouched and
 * attach the bearer token. Throws an ApiError on non-2xx.
 */
export async function fetchAsFile(
  urlOrPath: string,
  filename: string,
  signal?: AbortSignal,
): Promise<File> {
  const res = await fetch(urlOrPath, {
    method: "GET",
    headers: { ...authHeader() },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(text || `Fetch failed: ${res.status}`, res.status);
  }
  const blob = await res.blob();
  const type = blob.type || "application/pdf";
  return new File([blob], filename, { type });
}

/** Upload a lecture file (PDF/DOC/DOCX/ZIP/TXT/MD, max 50MB). */
export function uploadLectureFile(file: File) {
  return postMultipart("/files/lecture", file);
}

// ── Existing Course/Comment endpoints remain largely the same...
export function getCourse(id: string) { return request<CourseAPI>(`/courses/${id}`); }
export function publishCourse(id: string) { return request<CourseAPI>(`/courses/${id}/publish`, { method: "PATCH" }); }

// ── Notifications ───────────────────────────────────────

export interface NotificationAPI {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  courseId?: string;
  lectureId?: string;
  createdAt: string;
}

export function getNotifications() {
  return request<NotificationAPI[]>("/notifications");
}

export function getUnreadNotificationCount() {
  return request<{ count: number }>("/notifications/unread-count");
}

export function markNotificationRead(id: string) {
  return request<void>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return request<void>("/notifications/read-all", { method: "PATCH" });
}

export interface QuizAttemptRequest {
  quizId: string;
  courseId: string;
  score: number;
  passed: boolean;
  timeTakenSecs?: number;
}

export function submitQuizAttempt(req: QuizAttemptRequest) {
  return request<{ id: string }>("/quiz-attempts", { method: "POST", body: JSON.stringify(req) });
}

// ── Enrollment ──────────────────────────────────────────

export function checkMyEnrollment(courseId: string) {
  return request<{ enrolled: boolean }>(`/enrollments/me/${courseId}/status`);
}

export function enrollMe(courseId: string) {
  return request<{ id: string }>(`/enrollments/me/${courseId}`, { method: "POST" });
}
