import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import { AuthenticatedLayoutProvider } from "@/components/layout/AuthenticatedLayoutContext";

export function AuthenticatedLayout() {
  const { user } = useAuth();
  const displayName = user?.displayName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Utilizator";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  if (user?.role === "ADMIN") {
    return (
      <AuthenticatedLayoutProvider value>
        <Outlet />
      </AuthenticatedLayoutProvider>
    );
  }

  return (
    <AuthenticatedLayoutProvider value>
      <div className={user?.role === "PROFESSOR" ? "min-h-screen bg-edu-bg" : "min-h-screen bg-[#F4EFE8]"}>
        {user?.role === "PROFESSOR" ? (
          <ProfDashboardNavbar forceVisible />
        ) : (
          <StudentNavbar studentName={displayName} initials={initials} forceVisible />
        )}
        <Outlet />
      </div>
    </AuthenticatedLayoutProvider>
  );
}
