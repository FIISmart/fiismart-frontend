import { apiFetch } from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
  RegisterResponse,
} from "../types";

export const TOKEN_KEY = "fiismart_token";
const REFRESH_TOKEN_KEY = "fiismart_refresh_token";
const TOKEN_TYPE_KEY = "fiismart_token_type";

type TokenType = "legacy" | "cognito";

// ── Token helpers ────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, type: TokenType = "cognito"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(TOKEN_TYPE_KEY, type);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getTokenType(): TokenType {
  if (typeof window === "undefined") return "cognito";
  return (window.localStorage.getItem(TOKEN_TYPE_KEY) as TokenType) ?? "cognito";
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_TYPE_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Endpoints ────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res?.accessToken) setToken(res.accessToken, "cognito");
  if (res?.refreshToken) setRefreshToken(res.refreshToken);
  return res;
}

/**
 * Înregistrare cont nou via Cognito.
 * NU returnează tokens — utilizatorul trebuie să verifice email-ul înainte de login.
 */
export async function signup(payload: SignupPayload): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Verificare cod primit pe email după înregistrare.
 */
export async function verifyEmail(email: string, code: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

/**
 * Retrimite codul de verificare email.
 */
export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Inițiază fluxul de resetare parolă — trimite cod pe email.
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Confirmă resetarea parolei cu codul primit pe email.
 */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", {
      method: "POST",
      headers: authHeaders(),
    });
  } catch {
    // Ștergerea token-ului local este logout-ul efectiv.
  } finally {
    clearToken();
  }
}

/**
 * Hidratează utilizatorul curent. Apelează /auth/me cu Bearer token-ul stocat.
 * Returnează null dacă nu există token sau dacă sesiunea a expirat.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    return await apiFetch<AuthUser>("/auth/me", {
      method: "GET",
      headers: authHeaders(),
    });
  } catch {
    clearToken();
    return null;
  }
}

export async function refresh(): Promise<AuthResponse | null> {
  try {
    const res = await apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      headers: authHeaders(),
    });
    if (res?.accessToken) setToken(res.accessToken, "cognito");
    if (res?.refreshToken) setRefreshToken(res.refreshToken);
    return res;
  } catch {
    clearToken();
    return null;
  }
}
