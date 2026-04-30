import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthState, AuthUser } from "../types";

interface AuthContextValue extends AuthState {
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Stub provider seeded for Phase 1 scaffolding. The auth agent (Phase 2) replaces
 * this with the real implementation that calls /api/auth and persists tokens.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      login: (next) => setUser(next),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
