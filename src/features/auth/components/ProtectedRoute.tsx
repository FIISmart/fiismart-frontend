import { useEffect, useState } from "react";
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
 *   - If authenticated but the user's role isn't in `allowedRoles`, do
 *     ONE forced refresh of /auth/me before redirecting to /unauthorized.
 *     This recovers from BE-side role changes (e.g. an admin freshly added
 *     to the ADMIN Cognito group) without forcing a full logout/login.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const location = useLocation();
  const [revalidating, setRevalidating] = useState(false);
  const [revalidatedKey, setRevalidatedKey] = useState<string | null>(null);

  const allowed =
    !allowedRoles || allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));
  const guardKey = `${location.pathname}::${allowedRoles?.join(",") ?? ""}`;
  const shouldRevalidate =
    !isLoading && isAuthenticated && user && !allowed && revalidatedKey !== guardKey;

  useEffect(() => {
    if (!shouldRevalidate) return;
    let cancelled = false;
    setRevalidating(true);
    refreshUser().finally(() => {
      if (cancelled) return;
      setRevalidating(false);
      setRevalidatedKey(guardKey);
    });
    return () => {
      cancelled = true;
    };
  }, [shouldRevalidate, refreshUser, guardKey]);

  if (isLoading || revalidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-bg">
        <Spinner className="size-8 text-edu-purple" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (user.banned) {
    return <Navigate to="/banned" replace />;
  }

  // After the one-shot revalidation, trust the result.
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
