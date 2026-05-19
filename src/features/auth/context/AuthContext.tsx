import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthState,
  AuthUser,
  LoginPayload,
  RegisterResponse,
  SignupPayload,
} from "../types";
import { UserRole } from "../types";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
  verifyEmail as verifyEmailRequest,
  resendVerification as resendVerificationRequest,
  forgotPassword as forgotPasswordRequest,
  resetPassword as resetPasswordRequest,
  assignRole as assignRoleRequest,
  setToken,
  setRefreshToken,
} from "../services/auth.service";
import { exchangeCode } from "../services/cognito.service";
import { apiFetch } from "@/lib/api";

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<AuthUser>;
  /** Înregistrare — returnează mesaj, fără auto-login (trebuie verificat email-ul). */
  signup: (payload: SignupPayload) => Promise<RegisterResponse>;
  verifyEmail: (email: string, code: string) => Promise<{ message: string }>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  /** Completează fluxul Cognito PKCE: schimbă codul, stochează JWT, hidratează user-ul. */
  loginWithCognito: (code: string, state: string) => Promise<AuthUser>;
  /** Utilizatorii Google fără rol selectat apelează aceasta după ce aleg rolul. */
  assignRole: (role: UserRole, firstName?: string, lastName?: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await getCurrentUser();
      if (!cancelled) {
        setUser(me);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await loginRequest(payload);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<RegisterResponse> => {
    return signupRequest(payload);
    // Nu setăm user — utilizatorul trebuie să verifice email-ul înainte de login.
  }, []);

  const verifyEmail = useCallback(
    async (email: string, code: string) => verifyEmailRequest(email, code),
    []
  );

  const resendVerification = useCallback(
    async (email: string) => resendVerificationRequest(email),
    []
  );

  const forgotPassword = useCallback(
    async (email: string) => forgotPasswordRequest(email),
    []
  );

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string) =>
      resetPasswordRequest(email, code, newPassword),
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
  }, []);

  const loginWithCognito = useCallback(
    async (code: string, state: string): Promise<AuthUser> => {
      const tokens = await exchangeCode(code, state);
      // ID Token-ul conține claim-ul `email` pentru utilizatorii federați (Google).
      // Access Token-ul Cognito pentru Google nu include `email`, deci backend-ul
      // ar salva un placeholder "_pending_<sub>" în loc de adresa reală.
      setToken(tokens.idToken, "cognito");
      if (tokens.refreshToken) setRefreshToken(tokens.refreshToken);

      const me = await apiFetch<AuthUser>("/auth/me", {
        headers: { Authorization: `Bearer ${tokens.idToken}` },
      });
      // Nu setăm user în context dacă necesită selecția rolului —
      // pagina CompleteProfilePage va chema assignRole și va face setUser după.
      if (!me.needsRoleSelection) {
        setUser(me);
      }
      return me;
    },
    []
  );

  const assignRole = useCallback(async (role: UserRole, firstName?: string, lastName?: string): Promise<AuthUser> => {
    const updated = await assignRoleRequest(role, firstName, lastName);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signup,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      loginWithCognito,
      assignRole,
    }),
    [user, isLoading, login, signup, verifyEmail, resendVerification,
     forgotPassword, resetPassword, logout, loginWithCognito, assignRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
