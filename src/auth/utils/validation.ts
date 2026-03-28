// ============================================================
// validation.ts
// Pure validation helpers — no UI dependency.
// Used by both form components and can be reused in tests.
// ============================================================

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validators = {
  required: (value: string, label = "This field"): ValidationResult => {
    const ok = value.trim().length > 0;
    return { valid: ok, message: ok ? undefined : `${label} is required.` };
  },

  email: (value: string): ValidationResult => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    return { valid: ok, message: ok ? undefined : "Please enter a valid email address." };
  },

  /**
   * Password policy — adjust to match your backend's requirements.
   * Currently: min 8 chars, 1 uppercase, 1 digit.
   */
  password: (value: string): ValidationResult => {
    if (value.length < 8)
      return { valid: false, message: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(value))
      return { valid: false, message: "Password must contain at least one uppercase letter." };
    if (!/\d/.test(value))
      return { valid: false, message: "Password must contain at least one number." };
    return { valid: true };
  },

  passwordMatch: (password: string, confirm: string): ValidationResult => {
    const ok = password === confirm;
    return { valid: ok, message: ok ? undefined : "Passwords do not match." };
  },

  minLength: (value: string, min: number, label = "This field"): ValidationResult => {
    const ok = value.trim().length >= min;
    return {
      valid: ok,
      message: ok ? undefined : `${label} must be at least ${min} characters.`,
    };
  },

  maxLength: (value: string, max: number, label = "This field"): ValidationResult => {
    const ok = value.trim().length <= max;
    return {
      valid: ok,
      message: ok ? undefined : `${label} must be at most ${max} characters.`,
    };
  },
};

// ------------------------------------------------------------------
// Form-level validators (return error map or null)
// ------------------------------------------------------------------

import type { LoginFormValues, SignupFormValues } from "../types/auth.types";

export function validateLoginForm(
  values: LoginFormValues
): Partial<Record<keyof LoginFormValues, string>> {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};

  const emailResult = validators.email(values.email);
  if (!emailResult.valid) errors.email = emailResult.message;

  const pwResult = validators.required(values.password, "Password");
  if (!pwResult.valid) errors.password = pwResult.message;

  return errors;
}

export function validateSignupForm(
  values: SignupFormValues
): Partial<Record<keyof SignupFormValues, string>> {
  const errors: Partial<Record<keyof SignupFormValues, string>> = {};

  const fnResult = validators.minLength(values.firstName, 2, "First name");
  if (!fnResult.valid) errors.firstName = fnResult.message;

  const lnResult = validators.minLength(values.lastName, 2, "Last name");
  if (!lnResult.valid) errors.lastName = lnResult.message;

  const emailResult = validators.email(values.email);
  if (!emailResult.valid) errors.email = emailResult.message;

  const pwResult = validators.password(values.password);
  if (!pwResult.valid) errors.password = pwResult.message;

  const confirmResult = validators.passwordMatch(values.password, values.confirmPassword);
  if (!confirmResult.valid) errors.confirmPassword = confirmResult.message;

  if (!values.agreeToTerms)
    errors.agreeToTerms = "You must accept the terms and conditions.";

  return errors;
}
