import { UserRole, type UserRole as UserRoleType } from "@/features/auth/types";

export function getHomePath(role?: UserRoleType | string | null): string {
  if (role === UserRole.PROFESSOR) return "/professor/dashboard";
  if (role === UserRole.STUDENT) return "/student/dashboard";
  if (role === UserRole.ADMIN) return "/admin/dashboard";
  return "/";
}

export function getCoursesPath(role?: UserRoleType | string | null): string {
  if (role === UserRole.PROFESSOR) return "/professor/courses";
  if (role === UserRole.STUDENT) return "/student/courses";
  return getHomePath(role);
}

export function getStatisticsPath(role?: UserRoleType | string | null): string {
  if (role === UserRole.PROFESSOR) return "/professor/statistics";
  if (role === UserRole.STUDENT) return "/student/statistics";
  return getHomePath(role);
}
