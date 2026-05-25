import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Handles the OAuth2 redirect from Cognito Hosted UI.
 * Route: /auth/callback?code=...&state=...
 *
 * On success: exchanges the code for tokens, hydrates the user, and redirects
 * to the appropriate dashboard. On error: shows a toast and redirects to /auth.
 */
export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithCognito } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state") ?? "";
    const error = params.get("error");

    if (error) {
      toast.error(`Login anulat: ${params.get("error_description") ?? error}`);
      navigate("/auth", { replace: true });
      return;
    }

    if (!code) {
      toast.error("Callback OAuth invalid — parametrul code lipsește.");
      navigate("/auth", { replace: true });
      return;
    }

    loginWithCognito(code, state)
      .then((user) => {
        if (user.needsRoleSelection) {
          navigate("/auth/complete-profile", {
            replace: true,
            state: { firstName: user.firstName ?? "", lastName: user.lastName ?? "" },
          });
          return;
        }
        toast.success(`Bine ai revenit, ${user.firstName || user.email}!`);
        let dest = "/student/dashboard";
        if (user.role === "PROFESSOR") dest = "/professor/dashboard";
        if (user.role === "ADMIN") dest = "/admin/dashboard";
        navigate(dest, { replace: true });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Autentificare eșuată.";
        toast.error(msg);
        navigate("/auth", { replace: true });
      });
  }, [params, navigate, loginWithCognito]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-edu-bg">
      <div className="grid place-items-center size-14 rounded-2xl bg-edu-purple text-white">
        <GraduationCap className="size-6" />
      </div>
      <div className="flex items-center gap-2 text-edu-muted-fg">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm font-medium">Se finalizează autentificarea…</span>
      </div>
    </div>
  );
}
