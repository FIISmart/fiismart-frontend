export const API_BASE = import.meta.env.VITE_API_URL || "/api";
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN;

export function resolveApiAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  if (API_ORIGIN && url.startsWith("/api/")) {
    return `${API_ORIGIN.replace(/\/$/, "")}${url}`;
  }

  if (/^https?:\/\//i.test(API_BASE) && url.startsWith("/api/")) {
    return `${new URL(API_BASE).origin}${url}`;
  }

  return url;
}

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

export function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApiAssetBlobUrl(url: string): Promise<string> {
  const resolvedUrl = resolveApiAssetUrl(url);
  const res = await fetch(resolvedUrl, {
    headers: { ...authHeader() },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(err.message || `File request failed: ${res.status}`, res.status, err.code);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
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

export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  if (url.startsWith("/api/")) {
    try {
      const base = new URL(API_BASE, window.location.origin);
      return base.origin + url;
    } catch {
      return url;
    }
  }
  return url;
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
  enrollmentCount?: number;
  avgRating?: number;
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
  data: { title: string; type?: string; content?: string; videoUrl?: string | null; pdfUrl?: string | null; order: number; durationSecs: number }
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
  correctIdx?: number | null;
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
 * Streaming POST helper for Server-Sent Events (SSE).
 *
 * `EventSource` can't POST natively, so we use `fetch` with
 * `Accept: text/event-stream` and parse the body via a ReadableStream
 * reader. Yields one `{event, data}` object per complete SSE event block
 * (delimited by `\n\n`). `data:` is JSON-parsed when possible; otherwise
 * the raw string is yielded.
 *
 * - Bearer auth attached automatically (mirrors `apiFetch`).
 * - Caller-provided headers merge in (and override `Accept` if they wish).
 * - On non-2xx the body is read as text and an `ApiError` is thrown,
 *   matching `apiFetch`'s error shape.
 * - Pass `init.signal` to cancel. AbortError propagates after reader
 *   cleanup; downstream callers can match on `err.name === "AbortError"`.
 */
export async function* ssePost(
  path: string,
  body: BodyInit,
  init?: { signal?: AbortSignal; headers?: HeadersInit; method?: string },
): AsyncIterable<{ event: string; data: any }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? "POST",
    headers: {
      Accept: "text/event-stream",
      ...authHeader(),
      ...init?.headers,
    },
    body,
    signal: init?.signal,
  });

  if (!res.ok) {
    // Try JSON first (matches apiFetch error shape); fall back to text.
    const raw = await res.text().catch(() => "");
    let errMessage = `Request failed: ${res.status}`;
    let errCode: string | undefined;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          message?: string;
          code?: string;
          errors?: Record<string, string[]>;
        };
        errMessage = parsed.message || errMessage;
        errCode = parsed.code;
        if (errMessage === "Validation failed" && parsed.errors) {
          const firstMessages = Object.values(parsed.errors).flat();
          if (firstMessages.length > 0) errMessage = firstMessages[0];
        }
      } catch {
        errMessage = raw || res.statusText || errMessage;
      }
    } else {
      errMessage = res.statusText || errMessage;
    }
    throw new ApiError(errMessage, res.status, errCode);
  }

  if (!res.body) {
    // Server returned no body — nothing to stream.
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  // Wire up abort: cancel the reader so the underlying fetch stops too.
  const onAbort = () => {
    reader.cancel().catch(() => {
      /* already closed */
    });
  };
  init?.signal?.addEventListener("abort", onAbort);

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Flush any trailing event in the buffer (no terminating \n\n).
        const trailing = buffer.trim();
        if (trailing.length > 0) {
          const ev = parseSseBlock(trailing);
          if (ev) yield ev;
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      let sepIdx: number;
      // SSE events are separated by a blank line: "\n\n" (or "\r\n\r\n").
      // We normalize CRLF to LF first to keep parsing simple.
      buffer = buffer.replace(/\r\n/g, "\n");
      while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
        const rawBlock = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);
        const ev = parseSseBlock(rawBlock);
        if (ev) yield ev;
      }
    }
  } finally {
    init?.signal?.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {
      /* reader may already be released */
    }
  }
}

/**
 * Parse a single SSE event block (without trailing \n\n). Supports
 * multi-line `data:` per the SSE spec — multiple data lines are joined
 * with `\n`. Returns null if the block has no usable content.
 */
function parseSseBlock(block: string): { event: string; data: any } | null {
  let eventName = "message"; // SSE default per spec
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue; // skip empty + comments
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    // Spec: optional single space after colon is stripped.
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") {
      eventName = value;
    } else if (field === "data") {
      dataLines.push(value);
    }
    // Other fields (id, retry) are ignored for our use case.
  }

  if (dataLines.length === 0) {
    // Heartbeat/ping events sometimes carry no data; still surface them
    // so callers can observe the event name.
    return { event: eventName, data: null };
  }

  const rawData = dataLines.join("\n");
  try {
    return { event: eventName, data: JSON.parse(rawData) };
  } catch {
    return { event: eventName, data: rawData };
  }
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

// ── Quiz attempt lifecycle (timer + anti-cheat flow) ───────────────────────
//
// IMPORTANT: the FE never sends score/passed/correct. Grading is server-side.
// The previous shape (score + passed in the request) was a security hole and
// the review explicitly called it out — we removed it here.
//
// Also: BE returns `timeLimitSeconds` (seconds, NOT minutes). Schiporash's
// branch quietly conflated minutes/seconds in spots; we lock it down to
// seconds at the boundary so callers can't get it wrong.

export interface StartQuizAttemptResponse {
  attemptId: string;
  startedAt: string;
  /** Total time allowed for the attempt, in seconds (NOT minutes). */
  timeLimitSeconds: number;
  status: string;
}

export function startQuizAttempt(quizId: string): Promise<StartQuizAttemptResponse> {
  return request<StartQuizAttemptResponse>("/quiz-attempts/start", {
    method: "POST",
    body: JSON.stringify({ quizId }),
  });
}

export interface SubmitQuizAttemptAnswer {
  questionId: string;
  selectedIdx: number;
  writtenAnswer?: string;
}

export interface SubmitAttemptPayload {
  answers: SubmitQuizAttemptAnswer[];
}

/**
 * Per-answer detail returned by the submit endpoint. Includes the
 * BE-graded correctness for every question and (for free_text questions)
 * the AI grading payload: aiScore (0-100 or null on failure), aiConfidence
 * (0-1), aiReasoning (plain text), aiMissingConcepts (string list).
 */
export interface SubmitQuizAttemptAnswerResult {
  questionId: string;
  selectedIdx?: number;
  writtenAnswer?: string;
  correct: boolean;
  aiScore?: number | null;
  aiConfidence?: number;
  aiReasoning?: string;
  aiMissingConcepts?: string[];
}

export interface SubmitQuizAttemptResponse {
  id: string;
  score: number;
  passed: boolean;
  timeTakenSecs?: number;
  /** Per-question results — optional for back-compat with older BE responses. */
  answers?: SubmitQuizAttemptAnswerResult[];
}

export function submitQuizAttempt(
  attemptId: string,
  payload: SubmitAttemptPayload,
): Promise<SubmitQuizAttemptResponse> {
  return request<SubmitQuizAttemptResponse>(
    `/quiz-attempts/${attemptId}/submit`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function abandonQuizAttempt(attemptId: string): Promise<void> {
  return request<void>(`/quiz-attempts/${attemptId}/abandon`, {
    method: "POST",
    body: "{}",
  });
}

// ── Enrollment ──────────────────────────────────────────

export function checkMyEnrollment(courseId: string) {
  return request<{ enrolled: boolean }>(`/enrollments/me/${courseId}/status`);
}

export function enrollMe(courseId: string) {
  return request<{ id: string }>(`/enrollments/me/${courseId}`, { method: "POST" });
}

// Tutors
export interface TutorAPI {
  id: string;
  displayName: string;
  headline?: string | null;
  tags: string[];
  bio: string;
  courseCount: number;
  publishedCourseCount: number;
  avgRating: number;
  reviewCount: number;
  experienceYears: number;
  avatarUrl?: string | null;
  availability?: string | null;
  priceLabel?: string | null;
}

export function getTutors() {
  return request<TutorAPI[]>("/tutors");
}

export function createTutorRequest(data: { tutorId: string; message?: string }) {
  return request<{ id: string; status: string; tutorId: string; createdAt: string }>("/tutor-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface TutorRequestAPI {
  id: string;
  studentId: string;
  studentName?: string | null;
  tutorId: string;
  tutorName?: string | null;
  message: string;
  status: "pending" | "accepted" | "declined" | "resolved";
  createdAt: string;
}

export function getProfessorTutorRequests() {
  return request<TutorRequestAPI[]>("/tutor-requests/professor/me");
}

export function updateTutorRequestStatus(id: string, status: TutorRequestAPI["status"]) {
  return request<TutorRequestAPI>(`/tutor-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Admin ───────────────────────────────────────────────

export interface AdminStatsAPI {
  totalUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalAdmins: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalComments: number;
}

export interface AdminUserAPI {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  isAdmin: boolean;
  banned: boolean;
  banReason: string | null;
  bannedAt: string | null;
  needsRoleSelection: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
  ownedCoursesCount: number;
  enrolledCoursesCount: number;
}

export interface AdminCourseAPI {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  status: string;
  hidden: boolean;
  tags: string[];
  thumbnailUrl: string | null;
  enrollmentCount: number;
  moduleCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminEnrollmentAPI {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  status: string;
  overallProgress: number;
  enrolledAt: string | null;
}

export function adminGetStats() {
  return request<AdminStatsAPI>("/admin/stats");
}

export function adminGetUsers() {
  return request<AdminUserAPI[]>("/admin/users");
}

export function adminUpdateUser(userId: string, data: { displayName?: string; isAdmin?: boolean; banned?: boolean; banReason?: string }) {
  return request<AdminUserAPI>(`/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) });
}

export function adminDeleteUser(userId: string) {
  return request<void>(`/admin/users/${userId}`, { method: "DELETE" });
}

export function adminGetCourses() {
  return request<AdminCourseAPI[]>("/admin/courses");
}

export function adminUpdateCourse(courseId: string, data: { title?: string; description?: string; status?: string; hidden?: boolean; tags?: string[] }) {
  return request<AdminCourseAPI>(`/admin/courses/${courseId}`, { method: "PUT", body: JSON.stringify(data) });
}

export function adminDeleteCourse(courseId: string) {
  return request<void>(`/admin/courses/${courseId}`, { method: "DELETE" });
}

export function adminGetEnrollments() {
  return request<AdminEnrollmentAPI[]>("/admin/enrollments");
}

export function adminDeleteEnrollment(enrollmentId: string) {
  return request<void>(`/admin/enrollments/${enrollmentId}`, { method: "DELETE" });
}
