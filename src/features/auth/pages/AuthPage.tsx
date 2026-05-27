import * as React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, GraduationCap, Loader2, Mail } from "lucide-react";
import { isCognitoConfigured } from "@/lib/cognito-config";
import { buildLoginUrl } from "../services/cognito.service";
import { ApiError } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "../context/AuthContext";
import { UserRole, type AuthUser } from "../types";
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginValues,
  type SignupValues,
  type VerifyEmailValues,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "../utils/validation";

type LocationState = { from?: { pathname?: string } } | null;
type AuthView = "tabs" | "verify-email" | "forgot-password" | "reset-password";

const AUTH_ERROR_MAP: Record<string, string> = {
  // Email duplicat
  "An account with this email already exists": "Există deja un cont cu acest email.",
  // Login greșit
  "Invalid email or password": "Email sau parolă incorectă.",
  // Email neverificat
  "Please verify your email before signing in.": "Verifică-ți email-ul înainte de a te autentifica.",
  // Coduri verificare
  "Invalid or expired verification code": "Codul de verificare este invalid sau expirat.",
  "Verification code has expired": "Codul de verificare a expirat. Solicită unul nou.",
  // Rate limiting
  "Too many attempts, please try again later": "Prea multe încercări. Încearcă din nou mai târziu.",
  "Attempt limit exceeded, please try after some time": "Limită de încercări depășită. Încearcă mai târziu.",
  // Parolă
  "Password does not meet requirements": "Parola nu respectă cerințele de securitate.",
  "Password reset successfully. You can now sign in.": "Parola a fost resetată. Te poți autentifica.",
  // Utilizator
  "User not found": "Contul nu a fost găsit.",
  "User profile not found for this account": "Profilul contului nu a fost găsit. Contactează suportul.",
  // Token / sesiune
  "Authentication required": "Autentificare necesară.",
  "Missing or malformed Authorization header": "Lipsește token-ul de autentificare.",
  // Generic
  "An unexpected error occurred": "A apărut o eroare neașteptată. Încearcă din nou.",
};

function translateAuthError(raw: string): string {
  if (!raw) return "";
  return AUTH_ERROR_MAP[raw] ?? raw;
}

function dashboardFor(role: UserRole): string {
  if (role === UserRole.ADMIN) return "/admin/dashboard";
  if (role === UserRole.PROFESSOR) return "/professor/dashboard";
  return "/student/dashboard";
}

/**
 * True only when the given path's role-namespace matches the user's role.
 * Used to discard stale `from` paths after a logout/login-as-different-role
 * cycle (e.g. user was on /student/* then logged in as admin — we don't
 * want to send them back to /student/* and bounce them to /unauthorized).
 */
function roleAllowsPath(role: UserRole, path: string): boolean {
  if (path.startsWith("/admin/")) return role === UserRole.ADMIN;
  if (path.startsWith("/professor/")) return role === UserRole.PROFESSOR;
  if (path.startsWith("/student/")) return role === UserRole.STUDENT;
  // Non role-namespaced paths (e.g. /dashboard, /, /auth/...) — let the
  // target's own guard decide.
  return true;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, verifyEmail, resendVerification, forgotPassword, resetPassword } = useAuth();

  const [tab, setTab]             = useState<"login" | "signup">("login");
  const [view, setView]           = useState<AuthView>("tabs");
  const [pendingEmail, setPendingEmail]     = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  const goAfterAuth = (user: AuthUser) => {
    const state = location.state as LocationState;
    const fallback = dashboardFor(user.role);
    const from = state?.from?.pathname;
    const target = from && roleAllowsPath(user.role, from) ? from : fallback;
    navigate(target, { replace: true });
  };

  const handleSignupSuccess = (email: string, password: string) => {
    setPendingEmail(email);
    setPendingPassword(password);
    setView("verify-email");
  };

  const handleVerifySuccess = async () => {
    try {
      const user = await login({ email: pendingEmail, password: pendingPassword });
      setPendingPassword("");
      toast.success(`Bine ai venit, ${user.firstName || user.email}!`);
      goAfterAuth(user);
    } catch {
      setPendingPassword("");
      toast.success("Email verificat! Te poți autentifica acum.");
      setTab("login");
      setView("tabs");
    }
  };

  const handleUnconfirmedEmail = (email: string) => {
    setPendingEmail(email);
    setPendingPassword("");
    toast.info("Contul tău nu este confirmat. Introdu codul primit pe email.");
    setView("verify-email");
  };

  const handleForgotPassword = () => setView("forgot-password");

  const handleResetCodeSent = (email: string) => {
    setPendingEmail(email);
    setView("reset-password");
  };

  const handleResetSuccess = () => {
    toast.success("Parola a fost resetată. Te poți autentifica cu noua parolă.");
    setView("tabs");
    setTab("login");
  };

  return (
    <div className="min-h-screen w-full bg-edu-bg lg:grid lg:grid-cols-2 overflow-x-hidden">
      {/* ── Left brand panel ── */}
      <aside className="hidden lg:flex relative overflow-hidden min-w-0 bg-gradient-to-br from-edu-purple via-edu-lavender to-edu-purple text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full max-w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid place-items-center size-11 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight">FII Smart</span>
          </Link>
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-serif font-semibold leading-tight">
              Învață. Predă. Conectează.
            </h1>
            <p className="text-base xl:text-lg text-white/85 leading-relaxed">
              Platforma de e-learning a FII UAIC. Cursuri, lecții video și quiz-uri
              într-un singur loc — pentru studenți și profesori deopotrivă.
            </p>
          </div>
          <p className="text-xs text-white/70">
            &copy; {new Date().getFullYear()} FII Smart &middot; Faculty of Computer Science, UAIC
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex items-center justify-center min-w-0 p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand badge */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <span className="grid place-items-center size-10 rounded-xl bg-edu-purple text-white">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight text-edu-foreground">FII Smart</span>
          </div>

          {view === "tabs" && isCognitoConfigured && <GoogleLoginButton />}

          {/* ── Login / Signup tabs ── */}
          {view === "tabs" && (
            <Card className="border-border/60 shadow-lg">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                <CardHeader className="space-y-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-serif">Bine ai venit</CardTitle>
                    <CardDescription>
                      Autentifică-te sau creează un cont nou pentru a continua.
                    </CardDescription>
                  </div>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="login" className="mt-0">
                    <LoginForm
                      onSuccess={goAfterAuth}
                      onSwitchToSignup={() => setTab("signup")}
                      onForgotPassword={handleForgotPassword}
                      onUnconfirmedEmail={handleUnconfirmedEmail}
                      submit={login}
                    />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-0">
                    <SignupForm
                      onSuccess={handleSignupSuccess}
                      onSwitchToLogin={() => setTab("login")}
                      submit={signup}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          )}

          {/* ── Verificare email ── */}
          {view === "verify-email" && (
            <VerifyEmailForm
              email={pendingEmail}
              onSuccess={handleVerifySuccess}
              onResend={resendVerification}
              submitVerify={verifyEmail}
            />
          )}

          {/* ── Forgot password ── */}
          {view === "forgot-password" && (
            <ForgotPasswordForm
              onCodeSent={handleResetCodeSent}
              onBack={() => setView("tabs")}
              submit={forgotPassword}
            />
          )}

          {/* ── Reset password ── */}
          {view === "reset-password" && (
            <ResetPasswordForm
              email={pendingEmail}
              onSuccess={handleResetSuccess}
              onBack={() => setView("forgot-password")}
              submit={resetPassword}
            />
          )}

          <p className="text-xs text-muted-foreground text-center">
            Continuând, accepți{" "}
            <Link to="/terms" className="underline hover:text-edu-purple">Termenii Serviciului</Link>{" "}
            și{" "}
            <Link to="/privacy" className="underline hover:text-edu-purple">Politica de Confidențialitate</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Login form ───────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSuccess: (user: AuthUser) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onUnconfirmedEmail: (email: string) => void;
  submit: (payload: LoginValues) => Promise<AuthUser>;
}

function LoginForm({ onSuccess, onSwitchToSignup, onForgotPassword, onUnconfirmedEmail, submit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await submit(values);
      toast.success(`Bine ai revenit, ${user.firstName || user.email}!`);
      onSuccess(user);
    } catch (err) {
      if (err instanceof ApiError && err.code === "USER_NOT_CONFIRMED") {
        onUnconfirmedEmail(values.email);
        return;
      }
      const raw = err instanceof Error ? err.message : "";
      const message = translateAuthError(raw) || "Autentificare eșuată. Verifică datele.";
      setFormError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="nume@uaic.ro"
          aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Parolă</Label>
          <button type="button" className="text-xs text-edu-purple hover:underline"
            onClick={onForgotPassword}>
            Ai uitat parola?
          </button>
        </div>
        <PasswordInput id="login-password" autoComplete="current-password" placeholder="••••••••"
          aria-invalid={!!errors.password} show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)} {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      {formError && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
          <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Se autentifică…</> : "Login"}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Nu ai cont?{" "}
        <button type="button" onClick={onSwitchToSignup} className="text-edu-purple hover:underline font-medium">
          Creează unul
        </button>
      </p>
    </form>
  );
}

// ── Signup form ──────────────────────────────────────────────────────────────

interface SignupFormProps {
  onSuccess: (email: string, password: string) => void;
  onSwitchToLogin: () => void;
  submit: (payload: SignupValues) => Promise<{ message: string }>;
}

function SignupForm({ onSuccess, onSwitchToLogin, submit }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<SignupValues>({
      resolver: zodResolver(signupSchema),
      defaultValues: { firstName: "", lastName: "", email: "", password: "", role: UserRole.STUDENT },
    });

  const role = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await submit(values);
      toast.success("Cont creat! Verifică email-ul pentru codul de confirmare.");
      onSuccess(values.email, values.password);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = translateAuthError(raw) || "Înregistrare eșuată. Încearcă din nou.";
      setFormError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName">Prenume</Label>
          <Input id="signup-firstName" autoComplete="given-name" placeholder="Ana"
            aria-invalid={!!errors.firstName} {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastName">Nume</Label>
          <Input id="signup-lastName" autoComplete="family-name" placeholder="Popescu"
            aria-invalid={!!errors.lastName} {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" autoComplete="email" placeholder="nume@uaic.ro"
          aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Parolă</Label>
        <PasswordInput id="signup-password" autoComplete="new-password"
          placeholder="Min. 8 car., o majusculă, o cifră, un simbol"
          aria-invalid={!!errors.password} show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)} {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-role">Rol</Label>
        <Select value={role} onValueChange={(v) => setValue("role", v as UserRole, { shouldValidate: true })}>
          <SelectTrigger id="signup-role" aria-invalid={!!errors.role}>
            <SelectValue placeholder="Alege un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
            <SelectItem value={UserRole.PROFESSOR}>Profesor</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>
      {formError && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
          <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Se creează contul…</> : "Creează cont"}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Ai deja cont?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-edu-purple hover:underline font-medium">
          Autentifică-te
        </button>
      </p>
    </form>
  );
}

// ── Verify email form ────────────────────────────────────────────────────────

interface VerifyEmailFormProps {
  email: string;
  onSuccess: () => Promise<void>;
  onResend: (email: string) => Promise<{ message: string }>;
  submitVerify: (email: string, code: string) => Promise<{ message: string }>;
}

function VerifyEmailForm({ email, onSuccess, onResend, submitVerify }: VerifyEmailFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<VerifyEmailValues>({
      resolver: zodResolver(verifyEmailSchema),
      defaultValues: { code: "" },
    });

  const onSubmit = handleSubmit(async ({ code }) => {
    setFormError(null);
    try {
      await submitVerify(email, code);
      await onSuccess();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = translateAuthError(raw) || "Cod invalid sau expirat.";
      setFormError(message);
      reset({ code: "" });
    }
  });

  const handleResend = async () => {
    setFormError(null);
    try {
      await onResend(email);
      toast.success("Cod retrimis! Verifică email-ul.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setFormError(translateAuthError(raw) || "Nu s-a putut retrimite codul. Încearcă din nou.");
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-10 rounded-xl bg-edu-purple/10 text-edu-purple">
            <Mail className="size-5" />
          </span>
          <div>
            <CardTitle className="text-xl font-serif">Verifică email-ul</CardTitle>
            <CardDescription>Am trimis un cod de 6 cifre la <strong>{email}</strong></CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="verify-code">Cod de verificare</Label>
            <Input id="verify-code" placeholder="123456" maxLength={6}
              aria-invalid={!!errors.code || !!formError} {...register("code")} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          {formError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Se verifică…</> : "Confirmă email"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Nu ai primit codul?{" "}
            <button type="button" onClick={handleResend} className="text-edu-purple hover:underline font-medium">
              Retrimite
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Forgot password form ─────────────────────────────────────────────────────

interface ForgotPasswordFormProps {
  onCodeSent: (email: string) => void;
  onBack: () => void;
  submit: (email: string) => Promise<{ message: string }>;
}

function ForgotPasswordForm({ onCodeSent, onBack, submit }: ForgotPasswordFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotPasswordValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
    });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await submit(email);
      toast.success("Cod trimis! Verifică email-ul.");
      onCodeSent(email);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = translateAuthError(raw) || "A apărut o eroare. Încearcă din nou.";
      setFormError(message);
    }
  });

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Resetare parolă</CardTitle>
        <CardDescription>Introdu email-ul și îți vom trimite un cod de resetare.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input id="forgot-email" type="email" placeholder="nume@uaic.ro"
              aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          {formError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Se trimite…</> : "Trimite cod"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <button type="button" onClick={onBack} className="text-edu-purple hover:underline font-medium">
              Înapoi la login
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Reset password form ──────────────────────────────────────────────────────

interface ResetPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  submit: (email: string, code: string, newPassword: string) => Promise<{ message: string }>;
}

function ResetPasswordForm({ email, onSuccess, onBack, submit }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ResetPasswordValues>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { code: "", newPassword: "" },
    });

  const onSubmit = handleSubmit(async ({ code, newPassword }) => {
    setFormError(null);
    try {
      await submit(email, code, newPassword);
      onSuccess();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = translateAuthError(raw) || "Resetare eșuată. Verifică codul și încearcă din nou.";
      setFormError(message);
      reset({ code: "", newPassword: "" });
    }
  });

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Parolă nouă</CardTitle>
        <CardDescription>Introdu codul primit pe <strong>{email}</strong> și noua parolă.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-code">Cod de verificare</Label>
            <Input id="reset-code" placeholder="123456" maxLength={6}
              aria-invalid={!!errors.code || !!formError} {...register("code")} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-password">Parolă nouă</Label>
            <PasswordInput id="reset-password" autoComplete="new-password"
              placeholder="Min. 8 car., o majusculă, o cifră, un simbol"
              aria-invalid={!!errors.newPassword} show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)} {...register("newPassword")} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          {formError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Se resetează…</> : "Resetează parola"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <button type="button" onClick={onBack} className="text-edu-purple hover:underline font-medium">
              Înapoi
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Shared password input ────────────────────────────────────────────────────

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggleShow: () => void;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ show, onToggleShow, className, ...props }, ref) => (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} className={`pr-10 ${className ?? ""}`} {...props} />
      <button type="button" onClick={onToggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-2 my-auto grid place-items-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
);
PasswordInput.displayName = "PasswordInput";

// ── Google / Cognito login button ────────────────────────────────────────────

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      // identity_provider="Google" ocolește ecranul Hosted UI și redirecționează direct la Google.
      const url = await buildLoginUrl("Google");
      window.location.href = url;
    } catch {
      toast.error("Nu s-a putut iniția login-ul cu Google. Încearcă din nou.");
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full flex items-center gap-3"
      onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      Continuă cu Google
    </Button>
  );
}

