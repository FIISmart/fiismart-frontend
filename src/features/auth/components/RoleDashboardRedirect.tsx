import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export default function RoleDashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  let target = "/student/dashboard";
  if (user.role === UserRole.PROFESSOR) target = "/professor/dashboard";
  if (user.role === UserRole.ADMIN) target = "/admin/dashboard";

  return <Navigate to={target} replace />;
}