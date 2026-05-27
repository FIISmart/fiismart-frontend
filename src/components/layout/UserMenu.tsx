import { LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getHomePath } from "@/lib/routes";

type UserMenuProps = {
  displayName?: string;
  initials?: string;
  variant?: "light" | "warm";
};

export function UserMenu({ displayName, initials, variant = "light" }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = displayName || user?.displayName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Utilizator";
  const safeInitials = initials || name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
  const accountPath = accountPathForRole(user?.role);
  const dashboardPath = getHomePath(user?.role);

  const handleLogout = async () => {
    await logout();
    toast.success("Ai fost deconectat.");
    navigate("/auth", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-sm transition hover:bg-black/5 ${
            variant === "warm" ? "border-black/5 bg-white" : "border-border bg-card"
          }`}
          aria-label="Meniu cont"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {safeInitials}
            </span>
          )}
          <span className="hidden max-w-[150px] truncate text-sm font-semibold text-foreground sm:inline">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[80] w-64">
        <DropdownMenuLabel>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs font-medium text-primary">{roleLabel(user?.role)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(accountPath)} className="cursor-pointer">
          <UserCircle className="h-4 w-4" />
          Contul meu
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(dashboardPath)} className="cursor-pointer">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleLogout()} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Deconectare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function accountPathForRole(role?: string | null) {
  if (role === "PROFESSOR") return "/professor/account";
  if (role === "ADMIN") return "/admin/account";
  return "/student/account";
}

function roleLabel(role?: string | null) {
  if (role === "PROFESSOR") return "Profesor";
  if (role === "ADMIN") return "Administrator";
  return "Student";
}
