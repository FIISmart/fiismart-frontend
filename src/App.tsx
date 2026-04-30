import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { UserRole } from "@/features/auth/types";
import CourseBuilderPage from "@/features/course-builder/pages/CourseBuilderPage";
import CoursesListPage from "@/features/courses/pages/CoursesListPage";

/**
 * Top-level routing skeleton. Feature agents in Phase 2 fill the placeholder
 * routes (landing, auth, dashboards, video, quiz) by replacing the matching
 * elements with their real pages. The shape stays put.
 */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPlaceholder />} />
      <Route path="/auth" element={<AuthPlaceholder />} />
      <Route path="/terms" element={<LegalPlaceholder kind="Terms" />} />
      <Route path="/privacy" element={<LegalPlaceholder kind="Privacy" />} />
      <Route path="/unauthorized" element={<UnauthorizedPlaceholder />} />

      {/* Student-only */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
        <Route path="/student/dashboard" element={<Placeholder name="Student dashboard" />} />
        <Route
          path="/student/courses/:courseId/lectures/:lectureId"
          element={<Placeholder name="Lesson video" />}
        />
        <Route path="/student/quizzes/:quizId" element={<Placeholder name="Quiz player" />} />
      </Route>

      {/* Professor-only */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.PROFESSOR]} />}>
        <Route path="/professor/dashboard" element={<Placeholder name="Professor dashboard" />} />
        <Route path="/professor/courses" element={<CoursesListPage />} />
        <Route path="/professor/courses/:courseId" element={<CourseBuilderPage />} />
      </Route>

      {/* Compatibility shim — old route used by current course-builder dev links */}
      <Route path="/cursuri" element={<Navigate to="/professor/courses" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-bg text-edu-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-muted-foreground">Feature pending integration.</p>
      </div>
    </div>
  );
}

function LandingPlaceholder() {
  return <Placeholder name="Landing" />;
}
function AuthPlaceholder() {
  return <Placeholder name="Auth" />;
}
function LegalPlaceholder({ kind }: { kind: string }) {
  return <Placeholder name={kind} />;
}
function UnauthorizedPlaceholder() {
  return <Placeholder name="Access denied" />;
}
