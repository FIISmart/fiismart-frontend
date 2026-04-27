// ── Enums ─────────────────────────────────────────────────────────────────────

export enum UserRole {
  STUDENT   = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  cognitoSub: string
  displayName: string
  email: string
  role: UserRole
  emailVerified: boolean

  banned: boolean
  bannedBy: string | null
  bannedAt: string | null
  banReason: string | null

  ownedCourses: string[]
  enrolledCourseIds: string[]

  createdAt: string
  lastLoginAt: string | null
}

// ── Auth responses ────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
}

export interface RefreshPayload {
  refreshToken: string
  cognitoSub: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  newPassword: string
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface ResendVerificationPayload {
  email: string
}

// ── Auth context state ────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type AuthAction =
    | { type: 'AUTH_SUCCESS';    payload: AuthResponse; rememberMe?: boolean }
    | { type: 'REFRESH_SUCCESS'; payload: AuthResponse }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING';     payload: boolean }

// ── API error shape (matches Spring's error response) ────────────────────────

export interface ApiError {
  success: false
  message: string
  code?: string                         // e.g. "USER_NOT_CONFIRMED"
  errors?: Record<string, string[]>
}