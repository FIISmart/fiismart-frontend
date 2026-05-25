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
  displayName: string;
  role: string;
  isAdmin: boolean;
  banned: boolean;
  banReason?: string;
  bannedAt?: string;
  needsRoleSelection: boolean;
  createdAt: string;
  lastLoginAt?: string;
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
  courseId: string;
  status: string;
  overallProgress: number;
  enrolledAt: string | null;
}
