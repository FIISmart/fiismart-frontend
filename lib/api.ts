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

// ── Courses ─────────────────────────────────────────────

export interface CourseAPI {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  status: string;
  tags: string[];
  thumbnailUrl: string | null;
  language: string | null;
  enrollmentCount: number;
  avgRating: number;
  hidden: boolean;
  quizId: string | null;
  createdAt: string;
  updatedAt: string;
  lectures: LectureAPI[];
}

export interface LectureAPI {
  id: string;
  title: string;
  videoUrl: string | null;
  imageUrls: string[];
  order: number;
  durationSecs: number;
  publishedAt: string;
}

export interface QuizAPI {
  id: string;
  courseId: string;
  title: string;
  passingScore: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  questions: QuizQuestionAPI[];
}

export interface QuizQuestionAPI {
  id: string;
  text: string;
  type: string;
  points: number;
  options: string[];
  correctIdx: number;
  explanation: string | null;
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

// ── Course endpoints ────────────────────────────────────

export function getCourse(courseId: string) {
  return request<CourseAPI>(`/courses/${courseId}`);
}

export function getCoursesByTeacher(teacherId: string) {
  return request<CourseAPI[]>(`/courses?teacherId=${teacherId}`);
}

export function createCourse(data: {
  title: string;
  description: string;
  teacherId: string;
  tags?: string[];
  thumbnailUrl?: string;
  language?: string;
}) {
  return request<CourseAPI>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCourse(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    thumbnailUrl?: string;
    language?: string;
  }
) {
  return request<CourseAPI>(`/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function publishCourse(courseId: string) {
  return request<CourseAPI>(`/courses/${courseId}/publish`, { method: "PATCH" });
}

export function draftCourse(courseId: string) {
  return request<CourseAPI>(`/courses/${courseId}/draft`, { method: "PATCH" });
}

export function deleteCourse(courseId: string) {
  return request<void>(`/courses/${courseId}`, { method: "DELETE" });
}

// ── Lecture endpoints ───────────────────────────────────

export function addLecture(
  courseId: string,
  data: {
    title: string;
    videoUrl?: string;
    imageUrls?: string[];
    order: number;
    durationSecs: number;
  }
) {
  return request<LectureAPI>(`/courses/${courseId}/lectures`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLecture(
  courseId: string,
  lectureId: string,
  data: {
    title?: string;
    videoUrl?: string;
    imageUrls?: string[];
    order?: number;
    durationSecs?: number;
  }
) {
  return request<LectureAPI>(`/courses/${courseId}/lectures/${lectureId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteLecture(courseId: string, lectureId: string) {
  return request<void>(`/courses/${courseId}/lectures/${lectureId}`, {
    method: "DELETE",
  });
}

// ── Quiz endpoints ──────────────────────────────────────

export function getQuiz(courseId: string) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`);
}

export function createOrUpdateQuiz(
  courseId: string,
  data: {
    title: string;
    passingScore?: number;
    timeLimit?: number;
    shuffleQuestions?: boolean;
    questions: {
      text: string;
      type?: string;
      points?: number;
      options: string[];
      correctIdx: number;
      explanation?: string;
    }[];
  }
) {
  return request<QuizAPI>(`/courses/${courseId}/quiz`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteQuiz(courseId: string) {
  return request<void>(`/courses/${courseId}/quiz`, { method: "DELETE" });
}

// ── Comment endpoints ───────────────────────────────────

export function getComments(courseId: string) {
  return request<CommentAPI[]>(`/courses/${courseId}/comments`);
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
