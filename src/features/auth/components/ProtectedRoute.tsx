import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Stub guard for Phase 1. Behaviour:
 *   - If unauthenticated, redirect to /auth (preserving the intended destination).
 *   - If authenticated but role is not in allowedRoles, redirect to /unauthorized.
 *
 * The real auth agent will swap this for a token-aware version with loading states.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
