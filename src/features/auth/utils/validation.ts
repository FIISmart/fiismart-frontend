import { z } from "zod";
import { UserRole } from "../types";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name is too long."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number.")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)."),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a role." }),
  }),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Verification code must be 6 digits.")
    .max(6, "Verification code must be 6 digits.")
    .regex(/^\d+$/, "Verification code must contain only digits."),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Please enter a valid email address."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Verification code must be 6 digits.")
    .max(6, "Verification code must be 6 digits.")
    .regex(/^\d+$/, "Verification code must contain only digits."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number.")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)."),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
