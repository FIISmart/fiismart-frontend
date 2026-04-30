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
  SignupPayload,
} from "../types";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "../services/auth.service";

interface AuthContextValue extends AuthState {
  /** Run the login flow. Returns the authenticated user on success. */
  login: (payload: LoginPayload) => Promise<AuthUser>;
  /** Run the signup flow. Returns the freshly created user on success. */
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  /** Clear the local token + user, best-effort server logout. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Real auth provider. On mount it reads the bearer token from localStorage
 * (managed by `auth.service`) and attempts to hydrate the user via /auth/me.
 * While that call is in flight `isLoading` is true so guards can render a
 * spinner instead of bouncing the user back to /auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate from localStorage token on first render.
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

  const signup = useCallback(async (payload: SignupPayload): Promise<AuthUser> => {
    const res = await signupRequest(payload);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
