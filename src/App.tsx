import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { UserRole } from "@/features/auth/types";
import AuthPage from "@/features/auth/pages/AuthPage";
import AuthCallbackPage from "@/features/auth/pages/AuthCallbackPage";
import CompleteProfilePage from "@/features/auth/pages/CompleteProfilePage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";
import TermsOfServicePage from "@/features/auth/components/TermsOfServicePage";
import PrivacyPolicyPage from "@/features/auth/components/PrivacyPolicyPage";
import LandingPage from "@/features/landing/pages/LandingPage";
import ProfessorDashboardPage from "@/features/dashboard-prof/pages/ProfessorDashboardPage";
import StudentDashboardPage from "@/features/dashboard-student/pages/StudentDashboardPage";
import LessonVideoPage from "@/features/lesson-video/pages/LessonVideoPage";
import QuizPlayerPage from "@/features/quiz/pages/QuizPlayerPage";
import CourseBuilderPage from "@/features/course-builder/pages/CourseBuilderPage";
import MyQuizzesPage from "@/features/course-builder/pages/MyQuizzesPage";
import CoursesListPage from "@/features/courses/pages/CoursesListPage";
import StudentCoursesPage from "@/features/dashboard-student/pages/StudentCoursesPage";
import StudentCourseDetailPage from "@/features/dashboard-student/pages/StudentCourseDetailPage";
import { DevNav } from "@/components/DevNav";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Student-only */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/courses" element={<StudentCoursesPage />} />
        <Route path="/student/courses/:courseId" element={<StudentCourseDetailPage />} />
        <Route path="/student/courses/:courseId/lectures/:lectureId" element={<LessonVideoPage />} />
        <Route path="/student/quizzes/:quizId" element={<QuizPlayerPage />} />
      </Route>

      {/* Professor-only */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.PROFESSOR]} />}>
        <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
        <Route path="/professor/courses" element={<CoursesListPage />} />
        <Route path="/professor/quizzes" element={<MyQuizzesPage />} />
        <Route path="/professor/courses/:courseId" element={<CourseBuilderPage />} />
      </Route>

      {/* Compatibility shims for legacy / external links */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/signup" element={<Navigate to="/auth" replace />} />
      <Route path="/cursuri" element={<Navigate to="/professor/courses" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <DevNav />
    <Toaster richColors position="top-right" />
    </>
  );
}
