export const UserRole = {
  STUDENT: "STUDENT",
  PROFESSOR: "PROFESSOR",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Optional convenience field — backend may return a single display name. */
  displayName?: string;
  role: UserRole;
  emailVerified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Request payloads ─────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
}

// ── API response shapes ──────────────────────────────────────────

/**
 * Shape returned by `/auth/login` and `/auth/signup`. The backend on the
 * source branch returns Cognito-style tokens alongside the user; we keep the
 * accessToken and use it as our persisted bearer.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: AuthUser;
}
