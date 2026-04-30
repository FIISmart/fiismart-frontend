import * as React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";

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
  type LoginValues,
  type SignupValues,
} from "../utils/validation";

type LocationState = { from?: { pathname?: string } } | null;

function dashboardFor(role: UserRole): string {
  return role === UserRole.PROFESSOR ? "/professor/dashboard" : "/student/dashboard";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const goAfterAuth = (user: AuthUser) => {
    const state = location.state as LocationState;
    const fallback = dashboardFor(user.role);
    const target = state?.from?.pathname ?? fallback;
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-edu-bg lg:grid lg:grid-cols-2 overflow-x-hidden">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <aside className="hidden lg:flex relative overflow-hidden min-w-0 bg-gradient-to-br from-edu-purple via-edu-lavender to-edu-purple text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full max-w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid place-items-center size-11 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight">FIISmart</span>
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
            &copy; {new Date().getFullYear()} FIISmart &middot; Faculty of Computer Science, UAIC
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
            <span className="text-xl font-semibold tracking-tight text-edu-foreground">
              FIISmart
            </span>
          </div>

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
                    submit={login}
                  />
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <SignupForm
                    onSuccess={goAfterAuth}
                    onSwitchToLogin={() => setTab("login")}
                    submit={signup}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Continuând, accepți{" "}
            <Link to="/terms" className="underline hover:text-edu-purple">
              Termenii Serviciului
            </Link>{" "}
            și{" "}
            <Link to="/privacy" className="underline hover:text-edu-purple">
              Politica de Confidențialitate
            </Link>
            .
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
  submit: (payload: LoginValues) => Promise<AuthUser>;
}

function LoginForm({ onSuccess, onSwitchToSignup, submit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await submit(values);
      toast.success(`Bine ai revenit, ${user.firstName || user.email}!`);
      onSuccess(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Autentificare eșuată. Verifică datele.";
      toast.error(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="nume@uaic.ro"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Parolă</Label>
          <button
            type="button"
            className="text-xs text-edu-purple hover:underline"
            onClick={() =>
              toast.info("Recuperarea parolei va fi disponibilă în curând.")
            }
          >
            Ai uitat parola?
          </button>
        </div>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Se autentifică…
          </>
        ) : (
          "Login"
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Nu ai cont?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-edu-purple hover:underline font-medium"
        >
          Creează unul
        </button>
      </p>
    </form>
  );
}

// ── Signup form ──────────────────────────────────────────────────────────────

interface SignupFormProps {
  onSuccess: (user: AuthUser) => void;
  onSwitchToLogin: () => void;
  submit: (payload: SignupValues) => Promise<AuthUser>;
}

function SignupForm({ onSuccess, onSwitchToLogin, submit }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: UserRole.STUDENT,
    },
  });

  const role = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await submit(values);
      toast.success(`Cont creat. Bine ai venit, ${user.firstName || user.email}!`);
      onSuccess(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Înregistrare eșuată. Încearcă din nou.";
      toast.error(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName">Prenume</Label>
          <Input
            id="signup-firstName"
            autoComplete="given-name"
            placeholder="Ana"
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastName">Nume</Label>
          <Input
            id="signup-lastName"
            autoComplete="family-name"
            placeholder="Popescu"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="nume@uaic.ro"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Parolă</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="Min. 8 caractere, o majusculă, o cifră"
          aria-invalid={!!errors.password}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-role">Rol</Label>
        <Select
          value={role}
          onValueChange={(v) => setValue("role", v as UserRole, { shouldValidate: true })}
        >
          <SelectTrigger id="signup-role" aria-invalid={!!errors.role}>
            <SelectValue placeholder="Alege un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
            <SelectItem value={UserRole.PROFESSOR}>Profesor</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Se creează contul…
          </>
        ) : (
          "Creează cont"
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Ai deja cont?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-edu-purple hover:underline font-medium"
        >
          Autentifică-te
        </button>
      </p>
    </form>
  );
}

// ── Shared password input with show/hide toggle ──────────────────────────────

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggleShow: () => void;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ show, onToggleShow, className, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          className={`pr-10 ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-auto grid place-items-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
