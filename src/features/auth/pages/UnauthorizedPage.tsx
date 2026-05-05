import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

/**
 * Friendly access-denied page rendered by ProtectedRoute when an
 * authenticated user lands on a route their role doesn't grant access to.
 * Tailwind-only — no inline styles.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const homeFor = user?.role === UserRole.PROFESSOR ? "/professor/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-edu-bg px-6 py-12">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto grid place-items-center size-20 rounded-full bg-edu-purple/10 ring-1 ring-edu-purple/20">
          <ShieldAlert className="size-10 text-edu-purple" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-semibold text-edu-foreground">
            Acces refuzat
          </h1>
          <p className="text-muted-foreground">
            Nu ai permisiunea necesară pentru a accesa această pagină.
            {user ? (
              <>
                {" "}
                Ești autentificat ca <span className="font-medium">{user.email}</span>.
              </>
            ) : null}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Înapoi
          </Button>
          {user ? (
            <Button asChild>
              <Link to={homeFor}>Du-mă la dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Autentificare</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
