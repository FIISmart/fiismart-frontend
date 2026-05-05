import { apiFetch } from "@/lib/api";
import type {
  AddCommentPayload,
  CourseComment,
  CourseHeader,
  LectureDetails,
  LectureProgressPayload,
  ModuleSummary,
} from "../types";

/**
 * Student-facing endpoints for the lesson-video page.
 *
 * Source endpoints (from `curs-video-front`) were of the form
 * `http://localhost:8081/api/students/...`. We strip the host + `/api` prefix
 * and let `apiFetch` (which already prepends `/api` via the dev proxy) take
 * care of the rest.
 */
export const lessonVideoService = {
  getCourseInfo(studentId: string, courseId: string) {
    return apiFetch<CourseHeader>(
      `/students/${studentId}/courses/${courseId}`
    );
  },

  getModules(studentId: string, courseId: string) {
    return apiFetch<ModuleSummary[]>(
      `/students/${studentId}/courses/${courseId}/modules`
    );
  },

  getLectureDetails(studentId: string, courseId: string, lectureId: string) {
    return apiFetch<LectureDetails>(
      `/students/${studentId}/courses/${courseId}/lectures/${lectureId}`
    );
  },

  getComments(
    studentId: string,
    courseId: string,
    lectureId: string,
    sortBy: string = "recent"
  ) {
    return apiFetch<CourseComment[]>(
      `/students/${studentId}/courses/${courseId}/lectures/${lectureId}/comments?sortBy=${sortBy}`
    );
  },

  addComment(
    studentId: string,
    courseId: string,
    lectureId: string,
    payload: AddCommentPayload
  ) {
    return apiFetch<CourseComment>(
      `/students/${studentId}/courses/${courseId}/lectures/${lectureId}/comments`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  toggleLike(studentId: string, commentId: string) {
    return apiFetch<void>(
      `/students/${studentId}/comments/${commentId}/like`,
      { method: "POST" }
    );
  },

  saveProgress(
    studentId: string,
    courseId: string,
    lectureId: string,
    payload: LectureProgressPayload
  ) {
    return apiFetch<void>(
      `/students/${studentId}/courses/${courseId}/lectures/${lectureId}/progress`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },
};
