// ============================================================
// auth.types.ts
// Central type definitions for the FIISmart auth module.
// Update these interfaces if the Java backend changes its DTOs.
// ============================================================

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------

export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

// ------------------------------------------------------------------
// Domain Models
// ------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  subjectsOfInterest?: string[];
  emailVerified: boolean;
  createdAt: string; // ISO-8601
}

// ------------------------------------------------------------------
// Request / Response Payloads
// Mirrors the Java backend DTOs — adjust field names here if the
// backend team changes their naming convention.
// ------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // seconds
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // student or teacher at registration
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  message: string; // e.g. "Please verify your email"
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ------------------------------------------------------------------
// Generic API wrapper — all backend responses should follow this shape
// ------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>; // field-level validation errors from Spring
}

// ------------------------------------------------------------------
// Client-side Auth State
// ------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  code?: string; // e.g. "INVALID_CREDENTIALS", "EMAIL_NOT_VERIFIED"
  fieldErrors?: Record<string, string>; // maps form field → error message
}

// ------------------------------------------------------------------
// Form-level types (React Hook Form shapes)
// ------------------------------------------------------------------

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}
