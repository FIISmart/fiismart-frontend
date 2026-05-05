import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Real route guard. Behaviour:
 *   - While the AuthProvider is still hydrating (`isLoading`), render a
 *     centered shadcn Spinner so users don't get briefly bounced to /auth
 *     on a hard refresh of a protected page.
 *   - If unauthenticated, redirect to /auth and stash the originally
 *     requested location in router state so the auth page can return there.
 *   - If authenticated but the user's role isn't in `allowedRoles`,
 *     redirect to /unauthorized.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-bg">
        <Spinner className="size-8 text-edu-purple" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
