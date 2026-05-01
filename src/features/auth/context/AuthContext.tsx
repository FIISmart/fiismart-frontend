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
import { UserRole } from "../types";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "../services/auth.service";

const MOCK_USER_KEY = "fiismart_mock_user";

interface AuthContextValue extends AuthState {
  /** Run the login flow. Returns the authenticated user on success. */
  login: (payload: LoginPayload) => Promise<AuthUser>;
  /** Run the signup flow. Returns the freshly created user on success. */
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  /** Clear the local token + user, best-effort server logout. */
  logout: () => Promise<void>;
  /**
   * Dev-only: stamp a mock user (no backend call) and persist it so guards
   * accept the session across reloads. Use to walk every protected route
   * before the real backend is wired up.
   */
  loginAsMock: (role: UserRole) => AuthUser;
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

  // Hydrate on first render. Order:
  //  1. If a mock user is persisted in localStorage (dev preview flow),
  //     adopt it immediately — no network call.
  //  2. Otherwise call /auth/me with the bearer token if present.
  useEffect(() => {
    let cancelled = false;
    const mockJson =
      typeof window !== "undefined" ? window.localStorage.getItem(MOCK_USER_KEY) : null;
    if (mockJson) {
      try {
        setUser(JSON.parse(mockJson) as AuthUser);
        setIsLoading(false);
        return;
      } catch {
        window.localStorage.removeItem(MOCK_USER_KEY);
      }
    }
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
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(MOCK_USER_KEY);
    }
    await logoutRequest();
    setUser(null);
  }, []);

  const loginAsMock = useCallback((role: UserRole): AuthUser => {
    const mockUser: AuthUser =
      role === UserRole.PROFESSOR
        ? {
            id: "dev-professor-aaaaaaaaaaaaaaaaaaaaaa",
            email: "professor@dev.local",
            firstName: "Dev",
            lastName: "Professor",
            displayName: "Dev Professor",
            role: UserRole.PROFESSOR,
            emailVerified: true,
          }
        : {
            id: "dev-student-bbbbbbbbbbbbbbbbbbbbbbb",
            email: "student@dev.local",
            firstName: "Dev",
            lastName: "Student",
            displayName: "Dev Student",
            role: UserRole.STUDENT,
            emailVerified: true,
          };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    }
    setUser(mockUser);
    return mockUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signup,
      logout,
      loginAsMock,
    }),
    [user, isLoading, login, signup, logout, loginAsMock]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
