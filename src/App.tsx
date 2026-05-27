import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { UserRole } from "@/features/auth/types";
import AuthPage from "@/features/auth/pages/AuthPage";
import AuthCallbackPage from "@/features/auth/pages/AuthCallbackPage";
import CompleteProfilePage from "@/features/auth/pages/CompleteProfilePage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";
import BannedPage from "@/features/auth/pages/BannedPage";
import TermsOfServicePage from "@/features/auth/components/TermsOfServicePage";
import PrivacyPolicyPage from "@/features/auth/components/PrivacyPolicyPage";
import RoleDashboardRedirect from "@/features/auth/components/RoleDashboardRedirect";
import LandingPage from "@/features/landing/pages/LandingPage";
import PublicCoursesPage from "@/features/landing/pages/PublicCoursesPage";
import AboutPage from "@/features/landing/pages/AboutPage";
import ContactPage from "@/features/landing/pages/ContactPage";
import BecomeProfessorPage from "@/features/landing/pages/BecomeProfessorPage";
import PublicTutorsPage from "@/features/landing/pages/PublicTutorsPage";
import ProfessorDashboardPage from "@/features/dashboard-prof/pages/ProfessorDashboardPage";
import StudentDashboardPage from "@/features/dashboard-student/pages/StudentDashboardPage";
import LessonVideoPage from "@/features/lesson-video/pages/LessonVideoPage";
import QuizPlayerPage from "@/features/quiz/pages/QuizPlayerPage";
import CourseBuilderPage from "@/features/course-builder/pages/CourseBuilderPage";
import MyQuizzesPage from "@/features/course-builder/pages/MyQuizzesPage";
import CoursesListPage from "@/features/courses/pages/CoursesListPage";
import TimetablePage from "@/features/timetable/pages/TimetablePage";
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";
import TutorsPage from "@/features/tutors/pages/TutorsPage";
import ProfessorMentorRequestsPage from "@/features/tutors/pages/ProfessorMentorRequestsPage";
import StudentMentorRequestsPage from "@/features/tutors/pages/StudentMentorRequestsPage";
import MentorConversationPage from "@/features/tutors/pages/MentorConversationPage";
import StudentCoursesPage from "@/features/dashboard-student/pages/StudentCoursesPage";
import StudentCourseDetailPage from "@/features/dashboard-student/pages/StudentCourseDetailPage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import AdminCoursesPage from "@/features/admin/pages/AdminCoursesPage";
import AdminEnrollmentsPage from "@/features/admin/pages/AdminEnrollmentsPage";
import ProfessorPreviewRedirectPage from "@/features/lesson-video/pages/ProfessorPreviewRedirectPage";
import { Toaster } from "sonner";
import { ChatProvider } from "@/features/chat/context/ChatContext";
import { FloatingChatButton } from "@/features/chat/components/FloatingChatButton";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useAuth } from "@/features/auth/context/AuthContext";

/**
 * Chatbot global: provider-ul rămâne montat permanent (cost minim), iar
 * butonul + panoul sunt vizibile doar pentru utilizatorii autentificați.
 * Astfel paginile publice (landing, auth, terms) nu afișează chat-ul,
 * dar state-ul provider-ului există de îndată ce user-ul se loghează.
 */
function ChatMount() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== "PROFESSOR") return null;

  return (
      <>
        <FloatingChatButton />
        <ChatPanel />
      </>
  );
}

export default function App() {
  return (
      <ChatProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<PublicCoursesPage />} />
          <Route path="/tutors" element={<PublicTutorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/become-professor" element={<BecomeProfessorPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/banned" element={<BannedPage />} />

          {/* Student-only */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetailPage />} />
            <Route path="/student/courses/:courseId/lectures/:lectureId" element={<LessonVideoPage />} />
            <Route path="/student/quizzes/:quizId" element={<QuizPlayerPage />} />
            <Route path="/student/timetable" element={<TimetablePage />} />
            <Route path="/student/statistics" element={<StatisticsPage />} />
            <Route path="/student/tutors" element={<TutorsPage />} />
            <Route path="/student/mentor-requests" element={<StudentMentorRequestsPage />} />
            <Route path="/student/mentor-requests/:requestId/chat" element={<MentorConversationPage />} />
          </Route>

          {/* Professor-only */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.PROFESSOR]} />}>
            <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
            <Route path="/professor/courses" element={<CoursesListPage />} />
            <Route path="/professor/quizzes" element={<MyQuizzesPage />} />
            <Route path="/professor/courses/:courseId" element={<CourseBuilderPage />} />
            <Route path="/professor/timetable" element={<TimetablePage />} />
            <Route path="/professor/statistics" element={<StatisticsPage />} />
            <Route path="/professor/mentor-requests" element={<ProfessorMentorRequestsPage />} />
            <Route path="/professor/mentor-requests/:requestId/chat" element={<MentorConversationPage />} />

            {/* Professor course preview */}
            <Route path="/professor/preview/:courseId" element={<ProfessorPreviewRedirectPage />} />
            <Route
                path="/professor/preview/:courseId/lectures/:lectureId"
                element={<LessonVideoPage previewMode />}
            />
          </Route>

          {/* Admin-only */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
          </Route>

          {/* Role-aware dashboard alias */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.PROFESSOR, UserRole.ADMIN]} />}>
            <Route path="/dashboard" element={<RoleDashboardRedirect />} />
          </Route>

          {/* Compatibility shims for legacy / external links */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/cursuri" element={<Navigate to="/courses" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ChatMount />
        <Toaster richColors position="top-right" />
      </ChatProvider>
  );
}
