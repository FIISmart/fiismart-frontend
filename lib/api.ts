import type { Lesson, LessonType } from "./course-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Interfaces ──────────────────────────────────────────

export interface ModuleResponse {
  id: string;
  title: string;
  description: string;
  order: number;
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
  videoUrl: string | null;
  order: number;
  durationSecs: number;
}

export interface QuizAPI {
  id: string;
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
  data: { title: string; videoUrl?: string; order: number; durationSecs: number }
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

export function updateCourse(courseId: string, data: any) {
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

export function mapLectureToLesson(lecture: LectureAPI): Lesson {
  let detectedType: LessonType = 'video';
  const content = lecture.videoUrl || '';

  // Logic to determine type since DB doesn't store a 'type' field
  const normalizedContent = content.toLowerCase();
  if (normalizedContent.endsWith('.pdf')) {
    detectedType = 'pdf';
  } else if (normalizedContent.endsWith('.md') || normalizedContent.endsWith('.markdown')) {
    detectedType = 'markdown';
  } else if (content.length > 255 || (content && !content.startsWith('http'))) {
    detectedType = 'markdown';
  }

  return {
    id: lecture.id,
    title: lecture.title,
    type: detectedType,
    content: content,
    duration: lecture.durationSecs ? Math.round(lecture.durationSecs / 60) : undefined,
    order: lecture.order,
  };
}
// ── Quiz Endpoints ──────────────────────────────────────

export function getQuiz(courseId: string) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`);
}
export function deleteQuiz(courseId: string) {
  return request<void>(`/courses/${courseId}/quiz`, { 
    method: "DELETE" 
  });
}
export function createOrUpdateQuiz(
  courseId: string,
  data: {
    title: string;
    questions: {
      text: string;
      type: string;
      options: string[];
      correctIdx?: number;
      correctText?: string; // For written responses
      explanation?: string;
    }[];
  }
) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
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

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData, // no Content-Type header — browser sets multipart boundary
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }
  return res.json();
}

/** Upload a cover image for a course (JPG/PNG/WebP/GIF, max 5MB). */
export function uploadThumbnail(file: File) {
  return postMultipart("/files/thumbnail", file);
}

/** Upload a lecture file (PDF/DOC/DOCX/ZIP/TXT/MD, max 50MB). */
export function uploadLectureFile(file: File) {
  return postMultipart("/files/lecture", file);
}

// ── Existing Course/Comment endpoints remain largely the same...
export function getCourse(id: string) { return request<CourseAPI>(`/courses/${id}`); }
export function publishCourse(id: string) { return request<CourseAPI>(`/courses/${id}/publish`, { method: "PATCH" }); }