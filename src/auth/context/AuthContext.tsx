import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthState, AuthAction, AuthResponse } from '../types/auth.types'
import { authService } from '../services/auth.service'

// ── Storage keys ──────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  ACCESS_TOKEN:  'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  COGNITO_SUB:   'auth.cognitoSub',
} as const

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user:            null,
  accessToken:     sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  refreshToken:    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  isLoading:       true,
  isAuthenticated: false,
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {

    case 'AUTH_SUCCESS': {
      const { accessToken, refreshToken, user } = action.payload
      const persist = action.rememberMe ?? true
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      if (persist) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        localStorage.setItem(STORAGE_KEYS.COGNITO_SUB,   user.cognitoSub)
      } else {
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        sessionStorage.setItem(STORAGE_KEYS.COGNITO_SUB,   user.cognitoSub)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.COGNITO_SUB)
      }
      return {
        ...state,
        user,
        accessToken,
        refreshToken,
        isLoading:       false,
        isAuthenticated: true,
      }
    }

    case 'REFRESH_SUCCESS': {
      const { accessToken, refreshToken, user } = action.payload
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      // păstrăm tokenurile în același storage unde erau inițial
      const persist = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) !== null
      if (persist) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        localStorage.setItem(STORAGE_KEYS.COGNITO_SUB,   user.cognitoSub)
      } else {
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        sessionStorage.setItem(STORAGE_KEYS.COGNITO_SUB,   user.cognitoSub)
      }
      return {
        ...state,
        user,
        accessToken,
        refreshToken,
        isLoading:       false,
        isAuthenticated: true,
      }
    }

    case 'LOGOUT': {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.COGNITO_SUB)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.COGNITO_SUB)
      return {
        ...state,
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isLoading:       false,
        isAuthenticated: false,
      }
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  handleAuthSuccess: (response: AuthResponse, rememberMe?: boolean) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const handleAuthSuccess = useCallback((response: AuthResponse, rememberMe?: boolean) => {
    dispatch({ type: 'AUTH_SUCCESS', payload: response, rememberMe })
  }, [])

  const logout = useCallback(async () => {
    if (state.accessToken) {
      await authService.logout(state.accessToken).catch(() => {})
    }
    dispatch({ type: 'LOGOUT' })
  }, [state.accessToken])

  useEffect(() => {
    const refreshToken =
      localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ??
      sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const cognitoSub =
      localStorage.getItem(STORAGE_KEYS.COGNITO_SUB) ??
      sessionStorage.getItem(STORAGE_KEYS.COGNITO_SUB)

    if (!refreshToken || !cognitoSub) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    authService
        .refresh({ refreshToken, cognitoSub })
        .then((response) => {
          dispatch({ type: 'REFRESH_SUCCESS', payload: response })
        })
        .catch((err) => {
          // dacă e eroare de la server (token expirat/invalid) → logout complet
          // dacă e eroare de rețea (backend oprit) → păstrăm tokenurile, doar oprim loading
          const isServerError = err && typeof err === 'object' && 'success' in err
          if (isServerError) {
            dispatch({ type: 'LOGOUT' })
          } else {
            console.error('[Auth] Refresh eșuat (eroare de rețea):', err)
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        })
  }, [])

  return (
      <AuthContext.Provider value={{ ...state, handleAuthSuccess, logout }}>
        {children}
      </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}