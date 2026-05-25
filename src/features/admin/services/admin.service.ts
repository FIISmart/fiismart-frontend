import { apiFetch } from "@/lib/api";
import type { AdminStatsAPI, AdminUserAPI, AdminCourseAPI, AdminEnrollmentAPI } from "../types";

export const adminService = {
  getStats() {
    return apiFetch<AdminStatsAPI>("/admin/stats");
  },

  getUsers() {
    return apiFetch<AdminUserAPI[]>("/admin/users");
  },

  updateUser(userId: string, data: { displayName?: string; isAdmin?: boolean; banned?: boolean; banReason?: string }) {
    return apiFetch<AdminUserAPI>(`/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteUser(userId: string) {
    return apiFetch<void>(`/admin/users/${userId}`, { method: "DELETE" });
  },

  getCourses() {
    return apiFetch<AdminCourseAPI[]>("/admin/courses");
  },

  updateCourse(courseId: string, data: { title?: string; description?: string; status?: string; hidden?: boolean; tags?: string[] }) {
    return apiFetch<AdminCourseAPI>(`/admin/courses/${courseId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteCourse(courseId: string) {
    return apiFetch<void>(`/admin/courses/${courseId}`, { method: "DELETE" });
  },

  getEnrollments() {
    return apiFetch<AdminEnrollmentAPI[]>("/admin/enrollments");
  },

  deleteEnrollment(enrollmentId: string) {
    return apiFetch<void>(`/admin/enrollments/${enrollmentId}`, { method: "DELETE" });
  }
};
