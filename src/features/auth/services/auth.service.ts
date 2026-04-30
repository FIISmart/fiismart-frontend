import { apiFetch } from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "../types";

/** localStorage key used to persist the bearer token across reloads. */
export const TOKEN_KEY = "fiismart_token";

// ── Token helpers ────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Endpoints ────────────────────────────────────────────────────

/**
 * POST /auth/login — exchange credentials for an AuthResponse, persist the
 * accessToken, and return the response.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res?.accessToken) setToken(res.accessToken);
  return res;
}

/**
 * POST /auth/signup — register a new account. The backend on the source
 * branch returns the same AuthResponse shape as login, so we persist the
 * token here too for an automatic post-signup login.
 */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res?.accessToken) setToken(res.accessToken);
  return res;
}

/**
 * POST /auth/logout — best-effort server-side logout. We always clear the
 * local token even if the request fails (e.g. network down, token already
 * invalid), so the client cannot end up wedged in a half-logged-in state.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", {
      method: "POST",
      headers: authHeaders(),
    });
  } catch {
    // Swallow — clearing the token below is the actual logout from the UX's
    // perspective.
  } finally {
    clearToken();
  }
}

/**
 * GET /auth/me — hydrate the current user from a stored bearer token. Returns
 * null when there is no token or the token is rejected.
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

/**
 * POST /auth/refresh — rotate access token. Optional in the current happy
 * path but exported so callers can wire silent refresh later.
 */
export async function refresh(): Promise<AuthResponse | null> {
  try {
    const res = await apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      headers: authHeaders(),
    });
    if (res?.accessToken) setToken(res.accessToken);
    return res;
  } catch {
    clearToken();
    return null;
  }
}
