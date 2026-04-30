import { z } from "zod";
import { UserRole } from "../types";

/**
 * Login schema — email + password only. Password length matches the
 * backend's "must be at least 8 chars" rule but does not enforce the
 * uppercase/digit complexity here (we let the server reject weak existing
 * passwords; complexity is enforced on signup).
 */
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;

/**
 * Signup schema — mirrors the rules from origin/login-signin-front:
 *   - first/last name optional but must be at least 2 chars when present
 *   - password >= 8 chars, 1 uppercase, 1 digit
 *   - role must be STUDENT or PROFESSOR
 */
export const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(60, "First name is too long.")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(60, "Last name is too long.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number."),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a role." }),
  }),
});

export type SignupValues = z.infer<typeof signupSchema>;
