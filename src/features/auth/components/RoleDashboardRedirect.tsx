import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export default function RoleDashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === UserRole.PROFESSOR) return <Navigate to="/professor/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}