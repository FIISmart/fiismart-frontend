// ============================================================
// AuthPage.tsx
// Combined Login / Sign-up page for FIISmart.
//
//
// STYLING NOTE FOR THE TEAM:
//   All visual styles are expressed through the `styles` object
//   at the bottom of this file or via className strings that map
//   to a separate CSS/Tailwind file. To redesign the page, only
//   touch the `styles` section — all logic above it remains intact.
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  SignupFormValues,
} from "../types/auth.types";
import { UserRole } from "../types/auth.types";
import {
  validateLoginForm,
  validateSignupForm,
} from "../utils/validation";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type Tab = "login" | "signup";
type View = "auth" | "forgotPassword" | "forgotPasswordSent";

// ------------------------------------------------------------------
// Small reusable sub-components (kept in this file for portability;
// move to their own files once the team decides on a folder strategy)
// ------------------------------------------------------------------

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  hint?: string;
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  disabled,
  hint,
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <div style={styles.inputWrapper}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
            ...(disabled ? styles.inputDisabled : {}),
            ...(isPassword ? { paddingRight: "2.75rem" } : {}),
          }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((p) => !p)}
            style={styles.passwordToggle}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {hint && !error && (
        <span id={`${id}-hint`} style={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" style={styles.errorText}>
          {error}
        </span>
      )}
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
}

function SelectField({ id, label, value, onChange, options, error, disabled }: SelectFieldProps) {
  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        style={{ ...styles.input, ...(error ? styles.inputError : {}), cursor: "pointer" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" style={styles.errorText}>
          {error}
        </span>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Login Form
// ------------------------------------------------------------------

interface LoginFormProps {
  onForgotPassword: () => void;
  onSuccess: (user: ReturnType<typeof useAuth>["user"]) => void;
}

function LoginForm({ onForgotPassword, onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});

  // Sync server-side field errors into the form
  useEffect(() => {
    if (error?.fieldErrors) {
      setFieldErrors(error.fieldErrors as Partial<Record<keyof LoginFormValues, string>>);
    }
  }, [error]);

  const set = useCallback(
    (field: keyof LoginFormValues) => (v: string) => {
      setValues((prev) => ({ ...prev, [field]: v }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      clearError();
    },
    [clearError]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLoginForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const user = await login({ email: values.email, password: values.password });
    if (user) onSuccess(null); // AuthContext already holds the user
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <Field
        id="login-email"
        label="Email address"
        type="email"
        value={values.email}
        onChange={set("email")}
        error={fieldErrors.email}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isLoading}
      />
      <Field
        id="login-password"
        label="Password"
        type="password"
        value={values.password}
        onChange={set("password")}
        error={fieldErrors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={isLoading}
      />

      <div style={styles.row}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={values.rememberMe}
            onChange={(e) =>
              setValues((v) => ({ ...v, rememberMe: e.target.checked }))
            }
            style={styles.checkbox}
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          style={styles.linkButton}
        >
          Forgot password?
        </button>
      </div>

      {/* Global server error (not field-specific) */}
      {error && !error.fieldErrors && (
        <div role="alert" style={styles.globalError}>
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={styles.primaryButton}>
        {isLoading ? <Spinner /> : "Log In"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Signup Form
// ------------------------------------------------------------------

interface SignupFormProps {
  onSuccess: () => void;
}

function SignupForm({ onSuccess }: SignupFormProps) {
  const { register, isLoading, error, clearError } = useAuth();

  const [values, setValues] = useState<SignupFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.STUDENT,
    agreeToTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignupFormValues, string>>
  >({});

  useEffect(() => {
    if (error?.fieldErrors) {
      setFieldErrors(error.fieldErrors as Partial<Record<keyof SignupFormValues, string>>);
    }
  }, [error]);

  const set = useCallback(
    (field: keyof SignupFormValues) => (v: string) => {
      setValues((prev) => ({ ...prev, [field]: v }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      clearError();
    },
    [clearError]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateSignupForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const ok = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      role: values.role,
    });
    if (ok) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <div style={styles.twoCol}>
        <Field
          id="signup-firstname"
          label="First name"
          value={values.firstName}
          onChange={set("firstName")}
          error={fieldErrors.firstName}
          placeholder="Ana"
          autoComplete="given-name"
          disabled={isLoading}
        />
        <Field
          id="signup-lastname"
          label="Last name"
          value={values.lastName}
          onChange={set("lastName")}
          error={fieldErrors.lastName}
          placeholder="Ionescu"
          autoComplete="family-name"
          disabled={isLoading}
        />
      </div>

      <Field
        id="signup-email"
        label="Email address"
        type="email"
        value={values.email}
        onChange={set("email")}
        error={fieldErrors.email}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isLoading}
      />

      <SelectField
        id="signup-role"
        label="I am a..."
        value={values.role}
        onChange={set("role")}
        options={[
          { value: UserRole.STUDENT, label: "Student — I want to learn" },
          { value: UserRole.TEACHER, label: "Teacher — I want to teach" },
        ]}
        error={fieldErrors.role}
        disabled={isLoading}
      />

      <Field
        id="signup-password"
        label="Password"
        type="password"
        value={values.password}
        onChange={set("password")}
        error={fieldErrors.password}
        placeholder="••••••••"
        autoComplete="new-password"
        hint="At least 8 characters, one uppercase letter, one number."
        disabled={isLoading}
      />

      <Field
        id="signup-confirm"
        label="Confirm password"
        type="password"
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        error={fieldErrors.confirmPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        disabled={isLoading}
      />

      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={values.agreeToTerms}
          onChange={(e) => {
            setValues((v) => ({ ...v, agreeToTerms: e.target.checked }));
            setFieldErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
          }}
          style={styles.checkbox}
        />
        <span>
          I agree to the{" "}
          <a href="/terms" style={styles.inlineLink}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={styles.inlineLink}>
            Privacy Policy
          </a>
        </span>
      </label>
      {fieldErrors.agreeToTerms && (
        <span role="alert" style={styles.errorText}>
          {fieldErrors.agreeToTerms}
        </span>
      )}

      {error && !error.fieldErrors && (
        <div role="alert" style={styles.globalError}>
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={styles.primaryButton}>
        {isLoading ? <Spinner /> : "Create Account"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Forgot Password Form
// ------------------------------------------------------------------

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSent: () => void;
}

function ForgotPasswordForm({ onBack, onSent }: ForgotPasswordFormProps) {
  const [values, setValues] = useState<ForgotPasswordFormValues>({ email: "" });
  const [fieldError, setFieldError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setServerError(undefined);
    const result = await authService.forgotPassword({ email: values.email });
    setIsLoading(false);
    if (result.success) {
      onSent();
    } else {
      setServerError(result.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <p style={styles.bodyText}>
        Enter the email address associated with your account and we'll send you
        a link to reset your password.
      </p>

      <Field
        id="forgot-email"
        label="Email address"
        type="email"
        value={values.email}
        onChange={(v) => {
          setValues({ email: v });
          setFieldError(undefined);
          setServerError(undefined);
        }}
        error={fieldError}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isLoading}
      />

      {serverError && (
        <div role="alert" style={styles.globalError}>
          {serverError}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={styles.primaryButton}>
        {isLoading ? <Spinner /> : "Send Reset Link"}
      </button>

      <button type="button" onClick={onBack} style={styles.ghostButton}>
        ← Back to login
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Main AuthPage
// ------------------------------------------------------------------

interface AuthPageProps {
  /**
   * Called after a successful login or registration.
   * Use this to navigate the user to their dashboard.
   * Example (React Router): onSuccess={() => navigate("/dashboard")}
   */
  onSuccess?: (role: UserRole) => void;
  /** Initial tab to show. Default: "login" */
  defaultTab?: Tab;
}

export function AuthPage({ onSuccess, defaultTab = "login" }: AuthPageProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [view, setView] = useState<View>("auth");
  const announcerRef = useRef<HTMLDivElement>(null);

  // If auth context already has a user (e.g. from token refresh), call onSuccess
  useEffect(() => {
    if (user) {
      onSuccess?.(user.role);
    }
  }, [user, onSuccess]);

  const announce = (msg: string) => {
    if (announcerRef.current) announcerRef.current.textContent = msg;
  };

  if (view === "forgotPasswordSent") {
    return (
      <PageShell>
        <Card>
          <div style={styles.centeredContent}>
            <div style={styles.successIcon}>✉️</div>
            <h2 style={styles.cardTitle}>Check your email</h2>
            <p style={styles.bodyText}>
              We've sent a password reset link. It may take a minute to arrive.
              Check your spam folder if you don't see it.
            </p>
            <button
              type="button"
              onClick={() => setView("auth")}
              style={styles.primaryButton}
            >
              Back to login
            </button>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (view === "forgotPassword") {
    return (
      <PageShell>
        <Card>
          <div style={styles.logoRow}>
            <Logo />
          </div>
          <h2 style={styles.cardTitle}>Reset your password</h2>
          <ForgotPasswordForm
            onBack={() => setView("auth")}
            onSent={() => {
              setView("forgotPasswordSent");
              announce("Password reset email sent.");
            }}
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* SR live region for dynamic announcements */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}
      />

      <Card>
        <div style={styles.logoRow}>
          <Logo />
        </div>

        {/* Tab bar */}
        <div style={styles.tabBar} role="tablist" aria-label="Authentication">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                ...styles.tab,
                ...(tab === t ? styles.tabActive : {}),
              }}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div
          id="panel-login"
          role="tabpanel"
          aria-labelledby="tab-login"
          hidden={tab !== "login"}
        >
          {tab === "login" && (
            <LoginForm
              onForgotPassword={() => setView("forgotPassword")}
              onSuccess={() => {
                announce("Login successful.");
                // onSuccess is triggered via the useEffect above once user state updates
              }}
            />
          )}
        </div>

        <div
          id="panel-signup"
          role="tabpanel"
          aria-labelledby="tab-signup"
          hidden={tab !== "signup"}
        >
          {tab === "signup" && (
            <SignupForm
              onSuccess={() => {
                announce("Account created successfully.");
              }}
            />
          )}
        </div>

        {/* Cross-tab hint */}
        <p style={styles.switchHint}>
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                style={styles.linkButton}
              >
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                style={styles.linkButton}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </Card>
    </PageShell>
  );
}

// ------------------------------------------------------------------
// Layout wrappers
// ------------------------------------------------------------------

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.pageShell}>
      <div style={styles.bgDecorTop} aria-hidden />
      <div style={styles.bgDecorBottom} aria-hidden />
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={styles.card}>{children}</div>;
}

function Logo() {
  return (
    <div style={styles.logo}>
      <span style={styles.logoIcon}>🎓</span>
      <span style={styles.logoText}>FII Smart</span>
    </div>
  );
}

// ------------------------------------------------------------------
// Icon SVGs (inline, no external dependency)
// ------------------------------------------------------------------

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      style={styles.spinner}
      role="status"
      aria-label="Loading"
    />
  );
}

// ------------------------------------------------------------------
// STYLES
// All visual styles are centralised here.
// To restyle the page: edit only this section.
// The rest of the component logic is style-agnostic.
// ------------------------------------------------------------------

const COLOR = {
  bg: "#f2eae0",
  teal: "#84d3d9",
  lavender: "#bda6ce",
  purple: "#9b8ec7",
  purpleDark: "#7a6fb5",
  white: "#ffffff",
  text: "#2d2d2d",
  textMuted: "#7a7a7a",
  border: "#d9cfc5",
  errorBg: "#fff0f0",
  errorText: "#c0392b",
  errorBorder: "#e08080",
};

const styles: Record<string, React.CSSProperties> = {
  // ---- Layout ----
  pageShell: {
    minHeight: "100vh",
    backgroundColor: COLOR.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  bgDecorTop: {
    position: "absolute",
    top: "-8rem",
    right: "-8rem",
    width: "28rem",
    height: "28rem",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${COLOR.lavender}55, transparent 70%)`,
    pointerEvents: "none",
  },
  bgDecorBottom: {
    position: "absolute",
    bottom: "-6rem",
    left: "-6rem",
    width: "22rem",
    height: "22rem",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${COLOR.teal}44, transparent 70%)`,
    pointerEvents: "none",
  },
  card: {
    backgroundColor: COLOR.white,
    borderRadius: "1.25rem",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    position: "relative",
    zIndex: 1,
  },

  // ---- Logo ----
  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.75rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoIcon: { fontSize: "1.6rem" },
  logoText: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: COLOR.purple,
    letterSpacing: "-0.02em",
  },

  // ---- Tabs ----
  tabBar: {
    display: "flex",
    borderRadius: "0.625rem",
    backgroundColor: COLOR.bg,
    padding: "0.25rem",
    marginBottom: "2rem",
    gap: "0.25rem",
  },
  tab: {
    flex: 1,
    padding: "0.625rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "transparent",
    color: COLOR.textMuted,
    fontWeight: 500,
    fontSize: "0.9375rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    backgroundColor: COLOR.white,
    color: COLOR.purple,
    fontWeight: 600,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  // ---- Card heading ----
  cardTitle: {
    margin: "0 0 1.5rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: COLOR.text,
    textAlign: "center",
  },
  bodyText: {
    color: COLOR.textMuted,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0 0 1.25rem",
    textAlign: "center",
  },

  // ---- Form ----
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.125rem",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.875rem",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: COLOR.text,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "0.6875rem 0.875rem",
    border: `1.5px solid ${COLOR.border}`,
    borderRadius: "0.6rem",
    fontSize: "0.9375rem",
    color: COLOR.text,
    backgroundColor: COLOR.white,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    // Focus ring applied via onFocus/onBlur if needed; can also be done in CSS
  },
  inputError: {
    borderColor: COLOR.errorBorder,
    backgroundColor: COLOR.errorBg,
  },
  inputDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  passwordToggle: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: COLOR.textMuted,
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
  },
  hint: {
    fontSize: "0.78rem",
    color: COLOR.textMuted,
  },
  errorText: {
    fontSize: "0.8rem",
    color: COLOR.errorText,
  },
  globalError: {
    padding: "0.75rem 1rem",
    backgroundColor: COLOR.errorBg,
    border: `1px solid ${COLOR.errorBorder}`,
    borderRadius: "0.5rem",
    color: COLOR.errorText,
    fontSize: "0.875rem",
  },

  // ---- Row (remember me / forgot) ----
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: COLOR.text,
    cursor: "pointer",
    lineHeight: 1.5,
  },
  checkbox: {
    marginTop: "0.15rem",
    accentColor: COLOR.purple,
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
  },

  // ---- Buttons ----
  primaryButton: {
    width: "100%",
    padding: "0.8125rem",
    backgroundColor: COLOR.purple,
    color: COLOR.white,
    border: "none",
    borderRadius: "0.6rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s, opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },
  ghostButton: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "transparent",
    color: COLOR.textMuted,
    border: `1.5px solid ${COLOR.border}`,
    borderRadius: "0.6rem",
    fontSize: "0.9375rem",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: COLOR.purple,
    fontWeight: 500,
    fontSize: "0.875rem",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  inlineLink: {
    color: COLOR.purple,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },

  // ---- Bottom hint ----
  switchHint: {
    textAlign: "center",
    fontSize: "0.875rem",
    color: COLOR.textMuted,
    margin: "1.25rem 0 0",
  },

  // ---- Spinner ----
  spinner: {
    display: "inline-block",
    width: "1rem",
    height: "1rem",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  // ---- Success view ----
  centeredContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    textAlign: "center",
  },
  successIcon: {
    fontSize: "3rem",
  },
};

// Inject keyframes for spinner (once, globally)
if (typeof document !== "undefined" && !document.getElementById("educonnect-auth-styles")) {
  const styleEl = document.createElement("style");
  styleEl.id = "educonnect-auth-styles";
  styleEl.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    input:focus, select:focus {
      outline: none;
      border-color: #9b8ec7 !important;
      box-shadow: 0 0 0 3px rgba(155, 142, 199, 0.18);
    }
    button[type="submit"]:hover:not(:disabled) { background-color: #7a6fb5 !important; }
    button[type="submit"]:disabled { opacity: 0.65; cursor: not-allowed; }
  `;
  document.head.appendChild(styleEl);
}
