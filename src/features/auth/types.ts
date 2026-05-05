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
  /** Câmp de conveniență — backend-ul returnează și displayName. */
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

// ── API response shapes ──────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: AuthUser;
}

/**
 * Răspuns la /auth/signup — fără tokens; utilizatorul trebuie să verifice email-ul.
 */
export interface RegisterResponse {
  message: string;
}
