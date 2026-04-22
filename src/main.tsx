
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './auth/context/AuthContext'
import { AuthPage } from './auth/components/AuthPage'
import { VerifyEmailPage } from './auth/components/VerifyEmail'
import { ResetPasswordPage } from './auth/components/ResetPassword'
import { TermsOfServicePage } from './auth/components/TermsOfService'
import { PrivacyPolicyPage } from './auth/components/PrivacyPolicy'
import { UserRole } from './auth/types/auth.types'

function AuthPageWrapper() {
  const navigate = useNavigate()
  return (
    <AuthPage
      onSuccess={(role) => {
        if (role === UserRole.TEACHER) navigate('/teacher/dashboard')
        else navigate('/student/dashboard')
      }}
    />
  )
}

function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f2eae0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      gap: '1rem',
    }}>
      <span style={{ fontSize: '3rem' }}>🚫</span>
      <h1 style={{ color: '#2d2d2d', margin: 0 }}>Access Denied</h1>
      <p style={{ color: '#7a7a7a', margin: 0 }}>
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#9b8ec7',
          color: '#fff',
          border: 'none',
          borderRadius: '0.6rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Go Back
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth"           element={<AuthPageWrapper />} />
          <Route path="/verify-email"   element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
 
          <Route path="/terms"          element={<TermsOfServicePage />} />
          <Route path="/privacy"        element={<PrivacyPolicyPage />} />
 
          <Route path="/unauthorized"   element={<UnauthorizedPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
