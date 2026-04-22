// ============================================================
// VerifyEmail.tsx
// Handles the /verify-email?token=... link from the backend email.
//
// Flow:
//   1. User clicks the link in their inbox
//   2. Browser opens this page with ?token=... in the URL
//   3. We immediately call authService.verifyEmail() with that token
//   4. Show success → link to login, or error → explain what went wrong
// ============================================================

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth.service";

type Status = "loading" | "success" | "error" | "missing";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("missing");
      return;
    }

    authService.verifyEmail({ token }).then((result) => {
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.message ?? "Verification failed. Please try again.");
      }
    });
  }, []);

  return (
    <PageShell>
      <Card>
        <div style={styles.logoRow}>
          <Logo />
        </div>

        {status === "loading" && (
          <div style={styles.centeredContent}>
            <div style={styles.spinnerLarge} role="status" aria-label="Verifying..." />
            <h2 style={styles.cardTitle}>Verifying your email…</h2>
            <p style={styles.bodyText}>Just a moment, please.</p>
          </div>
        )}

        {status === "success" && (
          <div style={styles.centeredContent}>
            <div style={styles.bigIcon}>✅</div>
            <h2 style={styles.cardTitle}>Email verified!</h2>
            <p style={styles.bodyText}>
              Your email address has been confirmed. You're all set — go ahead
              and log in to your account.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/auth")}
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={styles.centeredContent}>
            <div style={styles.bigIcon}>❌</div>
            <h2 style={styles.cardTitle}>Verification failed</h2>
            <p style={styles.bodyText}>{errorMessage}</p>
            <p style={{ ...styles.bodyText, fontSize: "0.82rem" }}>
              This usually means the link has expired or was already used.
              Try registering again or contact support if the problem persists.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </button>
          </div>
        )}

        {status === "missing" && (
          <div style={styles.centeredContent}>
            <div style={styles.bigIcon}>🔗</div>
            <h2 style={styles.cardTitle}>No token found</h2>
            <p style={styles.bodyText}>
              This page needs a verification token from your email link.
              Please click the link in your verification email directly —
              don't navigate here manually.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </button>
          </div>
        )}
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
    margin: "0",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: COLOR.text,
    textAlign: "center",
  },
  bodyText: {
    color: COLOR.textMuted,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0",
    textAlign: "center",
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
    transition: "background-color 0.2s",
    marginTop: "0.5rem",
  },
  spinnerLarge: {
    display: "inline-block",
    width: "2.5rem",
    height: "2.5rem",
    border: `3px solid ${COLOR.lavender}`,
    borderTopColor: COLOR.purple,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
