// ============================================================
// ProtectedRoute.tsx
// Wrap any route that requires authentication.
// Works with React Router v6.
//
// Usage:
//   <Route path="/dashboard" element={
//     <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.TEACHER]}>
//       <Dashboard />
//     </ProtectedRoute>
//   } />
// ============================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with one of these roles can access. */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Default: "/auth" */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can swap this for a proper loading skeleton
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f2eae0",
        }}
      >
        <span style={{ color: "#9b8ec7", fontSize: "1rem" }}>Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role → send to their own dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// App.tsx — example wiring (not a final file, just a reference)
// ============================================================

/*
import React from "react";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserRole } from "./types/auth.types";

function AuthPageWrapper() {
  const navigate = useNavigate();
  return (
    <AuthPage
      onSuccess={(role) => {
        // Redirect to role-specific dashboard after login / signup
        if (role === UserRole.TEACHER) navigate("/teacher/dashboard");
        else if (role === UserRole.ADMIN) navigate("/admin");
        else navigate("/student/dashboard");
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPageWrapper />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
*/
