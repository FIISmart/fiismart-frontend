import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RefreshPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  User,
  ApiError,
} from '../types/auth.types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ── Core request helper ───────────────────────────────────────────────────────

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody: ApiError = await response.json().catch(() => ({
      success: false as const,
      message: 'An unexpected error occurred',
    }))
    throw errorBody
  }

  const text = await response.text()
  if (!text) return undefined as T

  return JSON.parse(text) as T
}

export const authService = {

  login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  register(payload: RegisterPayload): Promise<void> {
    return request<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  verifyEmail(payload: VerifyEmailPayload): Promise<void> {
    return request<void>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  resendVerification(payload: ResendVerificationPayload): Promise<void> {
    return request<void>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  refresh(payload: RefreshPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  logout(accessToken: string): Promise<void> {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    }, accessToken)
  },

  forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    return request<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  resetPassword(payload: ResetPasswordPayload): Promise<void> {
    return request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMe(accessToken: string): Promise<User> {
    return request<User>('/api/auth/me', {
      method: 'GET',
    }, accessToken)
  },
}