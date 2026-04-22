// ============================================================
// ResetPassword.tsx
// Handles the /reset-password?token=... link from the backend email.
//
// Flow:
//   1. User clicks "Reset password" link in their inbox
//   2. Browser opens this page with ?token=... in the URL
//   3. User types their new password + confirmation
//   4. We call authService.resetPassword() with the token + new password
//   5. Success → navigate to /auth to log in with new password
// ============================================================

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth.service";
import { validators } from "../utils/validation";

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

type View = "form" | "success" | "missing";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // If there's no token in the URL at all, show the missing state immediately
  const [view] = useState<View>(() => (token ? "form" : "missing"));

  const [values, setValues] = useState<FormValues>({
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormValues>>({});
  const [serverError, setServerError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field: keyof FormValues) => (v: string) => {
    setValues((prev) => ({ ...prev, [field]: v }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Partial<FormValues> = {};
    const pwResult = validators.password(values.newPassword);
    if (!pwResult.valid) errors.newPassword = pwResult.message;

    const matchResult = validators.passwordMatch(values.newPassword, values.confirmPassword);
    if (!matchResult.valid) errors.confirmPassword = matchResult.message;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setServerError(undefined);

    const result = await authService.resetPassword({
      token: token!,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });

    setIsLoading(false);

    if (result.success) {
      navigate("/reset-password?done=true", { replace: true });
      window.location.reload();
    } else {
      if (result.errors) {
        const mapped: Partial<FormValues> = {};
        if (result.errors.newPassword) mapped.newPassword = result.errors.newPassword[0];
        if (result.errors.confirmPassword) mapped.confirmPassword = result.errors.confirmPassword[0];
        setFieldErrors(mapped);
      } else {
        setServerError(result.message ?? "Something went wrong. Please try again.");
      }
    }
  };

  // ── Success state (after ?done=true redirect) ──────────────────────────────
  if (searchParams.get("done") === "true") {
    return (
      <PageShell>
        <Card>
          <div style={styles.logoRow}><Logo /></div>
          <div style={styles.centeredContent}>
            <div style={styles.bigIcon}>🔐</div>
            <h2 style={styles.cardTitle}>Password updated!</h2>
            <p style={styles.bodyText}>
              Your password has been reset successfully. You can now log in
              with your new password.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/auth")}
            >
              Go to Login
            </button>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── Missing token state ────────────────────────────────────────────────────
  if (view === "missing") {
    return (
      <PageShell>
        <Card>
          <div style={styles.logoRow}><Logo /></div>
          <div style={styles.centeredContent}>
            <div style={styles.bigIcon}>🔗</div>
            <h2 style={styles.cardTitle}>No reset token found</h2>
            <p style={styles.bodyText}>
              This page needs a password reset token from your email link.
              Please click the link in your reset email directly — don't
              navigate here manually.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </button>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <Card>
        <div style={styles.logoRow}><Logo /></div>
        <h2 style={styles.cardTitle}>Set a new password</h2>
        <p style={styles.bodyText}>
          Choose a strong password you haven't used before.
        </p>

        <form onSubmit={handleSubmit} noValidate style={styles.form}>

          {/* New password */}
          <div style={styles.fieldWrapper}>
            <label htmlFor="reset-new-password" style={styles.label}>
              New password
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="reset-new-password"
                type={showNew ? "text" : "password"}
                value={values.newPassword}
                onChange={(e) => set("newPassword")(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={!!fieldErrors.newPassword}
                aria-describedby={fieldErrors.newPassword ? "new-pw-error" : "new-pw-hint"}
                style={{
                  ...styles.input,
                  paddingRight: "2.75rem",
                  ...(fieldErrors.newPassword ? styles.inputError : {}),
                  ...(isLoading ? styles.inputDisabled : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                style={styles.passwordToggle}
                tabIndex={-1}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {!fieldErrors.newPassword && (
              <span id="new-pw-hint" style={styles.hint}>
                At least 8 characters, one uppercase letter, one number.
              </span>
            )}
            {fieldErrors.newPassword && (
              <span id="new-pw-error" role="alert" style={styles.errorText}>
                {fieldErrors.newPassword}
              </span>
            )}
          </div>

          {/* Confirm password */}
          <div style={styles.fieldWrapper}>
            <label htmlFor="reset-confirm-password" style={styles.label}>
              Confirm new password
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="reset-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={values.confirmPassword}
                onChange={(e) => set("confirmPassword")(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirm-pw-error" : undefined}
                style={{
                  ...styles.input,
                  paddingRight: "2.75rem",
                  ...(fieldErrors.confirmPassword ? styles.inputError : {}),
                  ...(isLoading ? styles.inputDisabled : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                style={styles.passwordToggle}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span id="confirm-pw-error" role="alert" style={styles.errorText}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div role="alert" style={styles.globalError}>
              {serverError}
            </div>
          )}

          <button type="submit" disabled={isLoading} style={styles.primaryButton}>
            {isLoading ? <Spinner /> : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth")}
            style={styles.ghostButton}
          >
            ← Back to login
          </button>

        </form>
      </Card>
    </PageShell>
  );
}

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
    <span style={styles.spinner} role="status" aria-label="Loading" />
  );
}

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
  centeredContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    textAlign: "center",
  },
  bigIcon: {
    fontSize: "3rem",
    lineHeight: 1,
  },
  cardTitle: {
    margin: "0 0 0.25rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: COLOR.text,
    textAlign: "center",
  },
  bodyText: {
    color: COLOR.textMuted,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0 0 1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.125rem",
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
  spinner: {
    display: "inline-block",
    width: "1rem",
    height: "1rem",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
