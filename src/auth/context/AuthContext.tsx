// ============================================================
// AuthContext.tsx
// Global auth state via React Context.
// Wrap your <App /> (or router root) with <AuthProvider>.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { authService } from "../services/auth.service";
import type {
  AuthError,
  AuthState,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth.types";

// ------------------------------------------------------------------
// State shape & reducer
// ------------------------------------------------------------------

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: AuthError }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on first load while we check localStorage token
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return { ...initialState, isLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// ------------------------------------------------------------------
// Context interface
// ------------------------------------------------------------------

interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: attempt to restore session from stored token
  useEffect(() => {
    const restoreSession = async () => {
      if (!authService.isLoggedIn()) {
        dispatch({ type: "AUTH_LOGOUT" });
        return;
      }
      const result = await authService.getCurrentUser();
      if (result.success && result.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: result.data as User });
      } else {
        // Token is stale / invalid — clear everything
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (payload: LoginRequest): Promise<boolean> => {
    dispatch({ type: "AUTH_START" });
    const result = await authService.login(payload);
    if (result.success && result.data) {
      dispatch({ type: "AUTH_SUCCESS", payload: result.data.user });
      return true;
    }
    dispatch({
      type: "AUTH_ERROR",
      payload: {
        message: result.message ?? "Login failed. Please try again.",
        fieldErrors: normaliseFieldErrors(result.errors),
      },
    });
    return false;
  }, []);

  const register = useCallback(
    async (payload: RegisterRequest): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });
      const result = await authService.register(payload);
      if (result.success && result.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: result.data.user });
        return true;
      }
      dispatch({
        type: "AUTH_ERROR",
        payload: {
          message: result.message ?? "Registration failed. Please try again.",
          fieldErrors: normaliseFieldErrors(result.errors),
        },
      });
      return false;
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, clearError }),
    [state, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

// ------------------------------------------------------------------
// Internal helper
// ------------------------------------------------------------------

/**
 * Spring Boot field errors come as { fieldName: ["message1", "message2"] }.
 * This flattens to { fieldName: "message1" } for easy form usage.
 */
function normaliseFieldErrors(
  errors?: Record<string, string[]>
): Record<string, string> | undefined {
  if (!errors) return undefined;
  return Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [k, v[0] ?? ""])
  );
}
