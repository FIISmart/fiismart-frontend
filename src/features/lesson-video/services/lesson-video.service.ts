import { apiFetch } from "@/lib/api.ts";
import type {
  AddCommentPayload,
  CourseComment,
  CourseHeader,
  LectureDetails,
  LectureProgressPayload,
  ModuleSummary,
  ReviewRequest,
  ReviewResponse,
  StreakResponse
} from "../types";

/**
 * Student-facing endpoints for Lesson Video page
 */

// 👇 EXTINDEM RequestInit ca să suportăm skipDevMock
export type ApiFetchOptions = RequestInit & {
  skipDevMock?: boolean;
};

export const lessonVideoService = {
  // =========================
  // COURSE
  // =========================

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

  getLectureDetails(
      studentId: string,
      courseId: string,
      lectureId: string
  ) {
    return apiFetch<LectureDetails>(
        `/students/${studentId}/courses/${courseId}/lectures/${lectureId}`
    );
  },

  // =========================
  // COMMENTS
  // =========================

  getComments(
      studentId: string,
      courseId: string,
      lectureId: string,
      sortBy: string = "recent",
      options?: ApiFetchOptions
  ) {
    return apiFetch<CourseComment[]>(
        `/students/${studentId}/courses/${courseId}/lectures/${lectureId}/comments?sortBy=${sortBy}`,
        options
    );
  },

  addComment(
      studentId: string,
      courseId: string,
      lectureId: string,
      payload: AddCommentPayload
  ) {
    if (payload.parentCommentId) {
      return apiFetch<CourseComment>(
          `/students/${studentId}/comments/${payload.parentCommentId}/replies`,
          {
            method: "POST",
            body: JSON.stringify({
              body: payload.body,
              timestampSecs: payload.timestampSecs,
              videoTimestamp: payload.videoTimestamp,
            }),
          }
      );
    }

    return apiFetch<CourseComment>(
        `/students/${studentId}/courses/${courseId}/lectures/${lectureId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            body: payload.body,
            timestampSecs: payload.timestampSecs,
            videoTimestamp: payload.videoTimestamp,
          }),
        }
    );
  },

  toggleLike(studentId: string, commentId: string) {
    return apiFetch<void>(
        `/students/${studentId}/comments/${commentId}/like`,
        {
          method: "POST",
        }
    );
  },

  // =========================
  // VIDEO PROGRESS
  // =========================

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

  // =========================
  // REVIEWS
  // =========================

  getReviews(
      studentId: string,
      courseId: string,
      _lectureId: string   // păstrat în semnătură pentru compatibilitate
  ) {
    return apiFetch<ReviewResponse[]>(`/reviews/course/${courseId}`);
  },

  addReview(
      studentId: string,
      courseId: string,
      _lectureId: string,
      payload: ReviewRequest
  ) {
    return apiFetch<ReviewResponse>(`/reviews`, {
      method: "POST",
      body: JSON.stringify({
        studentId,
        courseId,
        stars: payload.rating,
        body: payload.comment,
      }),
    });
  },

  getStudentStreak(studentId: string) {
    return apiFetch<StreakResponse>(
        `/students/${studentId}/streak`
    );
    // MOCK VERSION:
    /*return Promise.resolve({
       currentStreak: 12,
       hasCompletedToday: true,
      });*/
  },

  checkReviewExists(studentId: string, courseId: string) {
    return apiFetch<{ reviewed: boolean }>(`/reviews/exists/student/${studentId}/course/${courseId}`);
  },

  updateReview(reviewId: string, payload: { stars: number; body: string }) {
    return apiFetch(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

};