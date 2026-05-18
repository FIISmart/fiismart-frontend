import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export default function RoleDashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const target = user.role === UserRole.PROFESSOR ? "/professor/dashboard" : "/student/dashboard";
  return <Navigate to={target} replace />;
}