import { apiFetch } from "@/lib/api";
import type {
  AddCommentPayload,
  BackendReviewResponse,
  CourseComment,
  CourseHeader,
  LectureDetails,
  LectureProgressPayload,
  ModuleSummary,
  ReviewRequest,
  ReviewResponse,
  StreakResponse,
} from "../types";
import { mapReview } from "../types";

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
      _lectureId: string
  ) {
    return apiFetch<BackendReviewResponse[]>(
        `/reviews/course/${courseId}`
    ).then((list) => list.map(mapReview));
  },

  addReview(
      studentId: string,
      courseId: string,
      _lectureId: string,
      payload: ReviewRequest
  ) {
    const body = {
      courseId,
      stars: payload.stars,
      body: payload.body,
    };
    return apiFetch<BackendReviewResponse>(
        `/reviews`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
    ).then(mapReview);
  },
  getStudentStreak(studentId: string) {
    return apiFetch<StreakResponse>(
        `/students/${studentId}/streak`
    );
  },

};