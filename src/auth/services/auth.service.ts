// ============================================================
// auth.service.ts
// All HTTP calls to the Java backend live here.
//
// HOW TO CONFIGURE FOR YOUR BACKEND:
//   1. Set VITE_API_BASE_URL in your .env file, e.g.:
//      VITE_API_BASE_URL=http://localhost:8080
//   2. If the backend team changes any endpoint path, update
//      the AUTH_ENDPOINTS object below — no other file needs
//      to change.
//   3. If the backend uses a different auth header style, update
//      getAuthHeaders().
// ============================================================

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ApiResponse,
} from "../types/auth.types";

// ------------------------------------------------------------------
// Configuration — edit this section to match your backend
// ------------------------------------------------------------------

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8080";

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  REFRESH_TOKEN: "/api/auth/refresh",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_EMAIL: "/api/auth/verify-email",
  ME: "/api/auth/me", // GET — returns current user from token
} as const;

// ------------------------------------------------------------------
// Token storage helpers
// Centralised here so the team can swap localStorage ↔ httpOnly
// cookie strategy in a single place.
// ------------------------------------------------------------------

const TOKEN_KEY = "educonnect_access_token";
const REFRESH_TOKEN_KEY = "educonnect_refresh_token";

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void =>
    localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ------------------------------------------------------------------
// Base fetch wrapper with automatic token injection and error
// normalisation. If the backend team introduces an API gateway,
// add interceptor logic here.
// ------------------------------------------------------------------

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = tokenStorage.getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Handle non-JSON error responses gracefully
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    // Normalise HTTP errors into ApiResponse shape
    return {
      success: false,
      message:
        body?.message ??
        body?.error ??
        `HTTP ${response.status}: ${response.statusText}`,
      errors: body?.errors ?? undefined,
    };
  }

  // If the backend wraps responses in { success, data, message }
  if (body && "success" in body) {
    return body as ApiResponse<T>;
  }

  // If the backend returns the payload directly (common for auth endpoints)
  return { success: true, data: body as T };
}

// ------------------------------------------------------------------
// Automatic token refresh helper
// Call this once (e.g. in an Axios interceptor or fetch wrapper)
// when you receive a 401 to silently renew the session.
// ------------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    return null;
  }

  const result = await authService.refreshToken({ refreshToken });
  isRefreshing = false;

  if (result.success && result.data) {
    tokenStorage.setAccessToken(result.data.accessToken);
    tokenStorage.setRefreshToken(result.data.refreshToken);
    onRefreshed(result.data.accessToken);
    return result.data.accessToken;
  }

  tokenStorage.clear();
  return null;
}

// ------------------------------------------------------------------
// Auth Service — public API surface
// ------------------------------------------------------------------

export const authService = {
  /**
   * Authenticate with email + password.
   * On success, stores tokens and returns the full response.
   */
  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const result = await apiFetch<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
    }

    return result;
  },

  /**
   * Register a new account.
   * On success, stores tokens (user is auto-logged-in after registration).
   */
  async register(payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const result = await apiFetch<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
    }

    return result;
  },

  /**
   * Invalidate the session on the backend and clear local tokens.
   */
  async logout(): Promise<ApiResponse<void>> {
    const result = await apiFetch<void>(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
    });
    tokenStorage.clear();
    return result;
  },

  /**
   * Exchange a refresh token for a new access token.
   */
  async refreshToken(
    payload: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiFetch<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Send a password-reset email.
   */
  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ApiResponse<void>> {
    return apiFetch<void>(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Complete password reset with the token from the email link.
   */
  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return apiFetch<void>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Verify email address with token from the verification link.
   */
  async verifyEmail(
    payload: VerifyEmailRequest
  ): Promise<ApiResponse<void>> {
    return apiFetch<void>(AUTH_ENDPOINTS.VERIFY_EMAIL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch the currently authenticated user from the backend.
   * Useful for rehydrating auth state on app load.
   */
  async getCurrentUser() {
    return apiFetch(AUTH_ENDPOINTS.ME, { method: "GET" });
  },

  /** Returns true if a valid access token exists locally. */
  isLoggedIn(): boolean {
    return !!tokenStorage.getAccessToken();
  },
};
