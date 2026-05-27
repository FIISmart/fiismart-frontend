import { apiFetch } from "@/lib/api";

export interface LandingStats {
  activeStudents: number;
  totalTeachers: number;
  freeCourses: number;
  satisfactionRate: string;
}

export interface PopularCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  avgRating: number;
  enrollmentCount: number;
  tags: string[];
  teacherName: string;
  durationSecs: number;
}

export const landingService = {
  getStatistics() {
    return apiFetch<LandingStats>("/landing/statistics");
  },
  getCategories() {
    return apiFetch<Record<string, number>>("/landing/categories");
  },
  getPopularCourses() {
    return apiFetch<PopularCourse[]>("/landing/courses/popular");
  },
};
