import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './auth/context/AuthContext'
import { AuthPage } from './auth/components/AuthPage'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPageWrapper />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)

