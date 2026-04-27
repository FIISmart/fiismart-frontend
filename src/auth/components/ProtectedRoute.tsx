import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth.types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) return null

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/auth" replace />
    }

    return <>{children}</>
}