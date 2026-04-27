import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'
import { UserRole, type ApiError } from '../types/auth.types'

type View = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'

interface AuthPageProps {
    onSuccess: (role: UserRole) => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
    const { handleAuthSuccess } = useAuth()
    const [view, setView] = useState<View>('login')

    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe,   setRememberMe]   = useState(false)

    const [firstName,       setFirstName]       = useState('')
    const [lastName,        setLastName]        = useState('')
    const [role,            setRole]            = useState<UserRole>(UserRole.STUDENT)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirm,     setShowConfirm]     = useState(false)
    const [agreedToTerms,   setAgreedToTerms]   = useState(false)

    const [emailToVerify, setEmailToVerify] = useState('')
    const [verifyCode,    setVerifyCode]    = useState('')

    const [forgotEmail, setForgotEmail] = useState('')
    const [resetCode,   setResetCode]   = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showNew,     setShowNew]     = useState(false)

    const [isLoading,      setIsLoading]      = useState(false)
    const [error,          setError]          = useState<string | null>(null)
    const [fieldErrors,    setFieldErrors]    = useState<Record<string, string[]>>({})
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    function clearErrors() {
        setError(null)
        setFieldErrors({})
        setSuccessMessage(null)
    }

    function handleApiError(err: unknown) {
        const apiError = err as ApiError
        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
            setFieldErrors(apiError.errors)
        } else {
            setError(apiError.message ?? 'Something went wrong, please try again')
        }
    }

    function fieldError(field: string): string | undefined {
        return fieldErrors[field]?.[0]
    }

    function switchView(next: View) {
        clearErrors()
        setView(next)
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        clearErrors()
        setIsLoading(true)
        try {
            const response = await authService.login({ email, password })
            handleAuthSuccess(response, rememberMe)
            onSuccess(response.user.role)
        } catch (err) {
            const apiError = err as ApiError
            if (apiError.code === 'USER_NOT_CONFIRMED') {
                setEmailToVerify(email)
                switchView('verify-email')
                setSuccessMessage('Please verify your email before signing in.')
            } else {
                handleApiError(err)
            }
        } finally {
            setIsLoading(false)
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        clearErrors()
        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: ['Passwords do not match'] })
            return
        }
        if (!agreedToTerms) {
            setError('You must agree to the Terms of Service and Privacy Policy')
            return
        }
        setIsLoading(true)
        try {
            await authService.register({ firstName, lastName, email, password, role })
            setEmailToVerify(email)
            switchView('verify-email')
            setSuccessMessage('Account created! Check your email for a verification code.')
        } catch (err) {
            handleApiError(err)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleVerifyEmail(e: React.FormEvent) {
        e.preventDefault()
        clearErrors()
        setIsLoading(true)
        try {
            await authService.verifyEmail({ email: emailToVerify, code: verifyCode })
            setEmail(emailToVerify)
            switchView('login')
            setSuccessMessage('Email verified! You can now sign in.')
        } catch (err) {
            handleApiError(err)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResendCode() {
        clearErrors()
        setIsLoading(true)
        try {
            await authService.resendVerification({ email: emailToVerify })
            setSuccessMessage('A new code has been sent to your email.')
        } catch (err) {
            handleApiError(err)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault()
        clearErrors()
        setIsLoading(true)
        try {
            await authService.forgotPassword({ email: forgotEmail })
            switchView('reset-password')
            setSuccessMessage('Check your email for a verification code.')
        } catch (err) {
            handleApiError(err)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        clearErrors()
        setIsLoading(true)
        try {
            await authService.resetPassword({ email: forgotEmail, code: resetCode, newPassword })
            switchView('login')
            setSuccessMessage('Password reset successfully. You can now sign in.')
        } catch (err) {
            handleApiError(err)
        } finally {
            setIsLoading(false)
        }
    }

    const isAuthView = view === 'login' || view === 'register'

    return (
        <>
            <style>{css}</style>
            <div className="fs-page">
                <div className="fs-card">

                    <div className="fs-header">
                        <span className="fs-logo-icon">🎓</span>
                        <span className="fs-logo-text">FII Smart</span>
                    </div>

                    {isAuthView && (
                        <div className="fs-tabs">
                            <button className={`fs-tab ${view === 'login' ? 'fs-tab--active' : ''}`} onClick={() => switchView('login')} type="button">Log In</button>
                            <button className={`fs-tab ${view === 'register' ? 'fs-tab--active' : ''}`} onClick={() => switchView('register')} type="button">Sign Up</button>
                        </div>
                    )}

                    {/* ── Login ── */}
                    {view === 'login' && (
                        <form onSubmit={handleLogin} className="fs-form" noValidate>
                            <div className="fs-field">
                                <label className="fs-label">Email address</label>
                                <input type="email" className={`fs-input ${fieldError('email') ? 'fs-input--error' : ''}`} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                                {fieldError('email') && <span className="fs-field-error">{fieldError('email')}</span>}
                            </div>

                            <div className="fs-field">
                                <label className="fs-label">Password</label>
                                <div className="fs-input-wrap">
                                    <input type={showPassword ? 'text' : 'password'} className={`fs-input fs-input--icon ${fieldError('password') ? 'fs-input--error' : ''}`} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                                    <button type="button" className="fs-eye" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                                </div>
                                {fieldError('password') && <span className="fs-field-error">{fieldError('password')}</span>}
                            </div>

                            <div className="fs-row fs-row--spread">
                                <label className="fs-checkbox-label">
                                    <input type="checkbox" className="fs-checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                    Remember me
                                </label>
                                <button type="button" className="fs-link" onClick={() => { setForgotEmail(email); switchView('forgot-password') }}>Forgot password?</button>
                            </div>

                            {error          && <p className="fs-error">{error}</p>}
                            {successMessage && <p className="fs-success">{successMessage}</p>}

                            <button type="submit" className="fs-btn" disabled={isLoading}>{isLoading ? 'Signing in…' : 'Log In'}</button>
                            <p className="fs-footer-text">Don't have an account? <button type="button" className="fs-link" onClick={() => switchView('register')}>Sign up for free</button></p>
                        </form>
                    )}

                    {/* ── Register ── */}
                    {view === 'register' && (
                        <form onSubmit={handleRegister} className="fs-form" noValidate>
                            <div className="fs-row fs-row--cols2">
                                <div className="fs-field">
                                    <label className="fs-label">First name</label>
                                    <input type="text" className={`fs-input ${fieldError('firstName') ? 'fs-input--error' : ''}`} placeholder="Ana" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" required />
                                    {fieldError('firstName') && <span className="fs-field-error">{fieldError('firstName')}</span>}
                                </div>
                                <div className="fs-field">
                                    <label className="fs-label">Last name</label>
                                    <input type="text" className={`fs-input ${fieldError('lastName') ? 'fs-input--error' : ''}`} placeholder="Ionescu" value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" required />
                                    {fieldError('lastName') && <span className="fs-field-error">{fieldError('lastName')}</span>}
                                </div>
                            </div>

                            <div className="fs-field">
                                <label className="fs-label">Email address</label>
                                <input type="email" className={`fs-input ${fieldError('email') ? 'fs-input--error' : ''}`} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                                {fieldError('email') && <span className="fs-field-error">{fieldError('email')}</span>}
                            </div>

                            <div className="fs-field">
                                <label className="fs-label">I am a…</label>
                                <select className="fs-select" value={role} onChange={e => setRole(e.target.value as UserRole)} required>
                                    <option value={UserRole.STUDENT}>Student — I want to learn</option>
                                    <option value={UserRole.PROFESSOR}>Professor — I want to teach</option>
                                </select>
                            </div>

                            <div className="fs-field">
                                <label className="fs-label">Password</label>
                                <div className="fs-input-wrap">
                                    <input type={showPassword ? 'text' : 'password'} className={`fs-input fs-input--icon ${fieldError('password') ? 'fs-input--error' : ''}`} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
                                    <button type="button" className="fs-eye" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                                </div>
                                <span className="fs-hint">At least 8 characters, one uppercase letter, one number.</span>
                                {fieldError('password') && <span className="fs-field-error">{fieldError('password')}</span>}
                            </div>

                            <div className="fs-field">
                                <label className="fs-label">Confirm password</label>
                                <div className="fs-input-wrap">
                                    <input type={showConfirm ? 'text' : 'password'} className={`fs-input fs-input--icon ${fieldError('confirmPassword') ? 'fs-input--error' : ''}`} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                                    <button type="button" className="fs-eye" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? <EyeOffIcon /> : <EyeIcon />}</button>
                                </div>
                                {fieldError('confirmPassword') && <span className="fs-field-error">{fieldError('confirmPassword')}</span>}
                            </div>

                            <label className="fs-checkbox-label">
                                <input type="checkbox" className="fs-checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} />
                                I agree to the <a href="/terms" className="fs-link">Terms of Service</a> and <a href="/privacy" className="fs-link">Privacy Policy</a>
                            </label>

                            {error && <p className="fs-error">{error}</p>}
                            <button type="submit" className="fs-btn" disabled={isLoading}>{isLoading ? 'Creating account…' : 'Create Account'}</button>
                            <p className="fs-footer-text">Already have an account? <button type="button" className="fs-link" onClick={() => switchView('login')}>Log in</button></p>
                        </form>
                    )}

                    {/* ── Verify email ── */}
                    {view === 'verify-email' && (
                        <div className="fs-form">
                            <div className="fs-verify-icon">📬</div>
                            <h2 className="fs-section-title">Check your inbox</h2>
                            <p className="fs-section-subtitle">We sent a 6-digit code to <strong>{emailToVerify}</strong>. Enter it below to activate your account.</p>
                            {successMessage && <p className="fs-success">{successMessage}</p>}
                            <form onSubmit={handleVerifyEmail} noValidate>
                                <div className="fs-field">
                                    <label className="fs-label">Verification code</label>
                                    <input type="text" className={`fs-input fs-input--code ${fieldError('code') ? 'fs-input--error' : ''}`} placeholder="000000" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} required />
                                    {fieldError('code') && <span className="fs-field-error">{fieldError('code')}</span>}
                                </div>
                                {error && <p className="fs-error">{error}</p>}
                                <button type="submit" className="fs-btn" disabled={isLoading} style={{ marginTop: '0.75rem' }}>{isLoading ? 'Verifying…' : 'Verify Email'}</button>
                            </form>
                            <div className="fs-verify-links">
                                <button className="fs-link" onClick={handleResendCode} disabled={isLoading} type="button">Resend code</button>
                                <button className="fs-link" onClick={() => switchView('login')} type="button">Back to sign in</button>
                            </div>
                        </div>
                    )}

                    {/* ── Forgot password ── */}
                    {view === 'forgot-password' && (
                        <div className="fs-form">
                            <h2 className="fs-section-title">Reset your password</h2>
                            <p className="fs-section-subtitle">Enter the email address associated with your account and we'll send you a code to reset your password.</p>
                            <form onSubmit={handleForgotPassword} noValidate>
                                <div className="fs-field">
                                    <label className="fs-label">Email address</label>
                                    <input type="email" className={`fs-input ${fieldError('email') ? 'fs-input--error' : ''}`} placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoComplete="email" required />
                                    {fieldError('email') && <span className="fs-field-error">{fieldError('email')}</span>}
                                </div>
                                {error && <p className="fs-error">{error}</p>}
                                <button type="submit" className="fs-btn" disabled={isLoading} style={{ marginTop: '0.75rem' }}>{isLoading ? 'Sending…' : 'Send Reset Code'}</button>
                            </form>
                            <button type="button" className="fs-btn-outline" onClick={() => switchView('login')}>← Back to login</button>
                        </div>
                    )}

                    {/* ── Reset password ── */}
                    {view === 'reset-password' && (
                        <div className="fs-form">
                            <h2 className="fs-section-title">Enter new password</h2>
                            <p className="fs-section-subtitle">Enter the code from your email and choose a new password.</p>
                            {successMessage && <p className="fs-success">{successMessage}</p>}
                            <form onSubmit={handleResetPassword} noValidate>
                                <div className="fs-field">
                                    <label className="fs-label">Verification code</label>
                                    <input type="text" className={`fs-input fs-input--code ${fieldError('code') ? 'fs-input--error' : ''}`} placeholder="000000" value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} required />
                                    {fieldError('code') && <span className="fs-field-error">{fieldError('code')}</span>}
                                </div>
                                <div className="fs-field">
                                    <label className="fs-label">New password</label>
                                    <div className="fs-input-wrap">
                                        <input type={showNew ? 'text' : 'password'} className={`fs-input fs-input--icon ${fieldError('newPassword') ? 'fs-input--error' : ''}`} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required />
                                        <button type="button" className="fs-eye" onClick={() => setShowNew(v => !v)}>{showNew ? <EyeOffIcon /> : <EyeIcon />}</button>
                                    </div>
                                    {fieldError('newPassword') && <span className="fs-field-error">{fieldError('newPassword')}</span>}
                                </div>
                                {error && <p className="fs-error">{error}</p>}
                                <button type="submit" className="fs-btn" disabled={isLoading} style={{ marginTop: '0.75rem' }}>{isLoading ? 'Resetting…' : 'Reset Password'}</button>
                            </form>
                            <button type="button" className="fs-btn-outline" onClick={() => switchView('login')}>← Back to login</button>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    )
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:           #ede8df;
    --card:         #ffffff;
    --purple:       #8875b0;
    --purple-hover: #7464a0;
    --border:       #e0d9ce;
    --text:         #2a2520;
    --text-soft:    #7d7168;
    --input-bg:     #faf8f5;
    --error:        #b83232;
    --success:      #2e7d52;
    --radius:       14px;
    --radius-sm:    9px;
    --shadow:       0 8px 48px rgba(80, 60, 40, 0.13);
  }

  .fs-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    padding: 1.5rem;
  }

  .fs-card {
    background: var(--card);
    border-radius: 22px;
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 460px;
    padding: 2.25rem 2.5rem 2.25rem;
  }

  .fs-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.75rem;
  }
  .fs-logo-icon { font-size: 1.5rem; }
  .fs-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 1.45rem;
    color: var(--purple);
    letter-spacing: -0.01em;
  }

  .fs-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--bg);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 1.75rem;
    gap: 2px;
  }
  .fs-tab {
    padding: 0.6rem 1rem;
    border: none;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-soft);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .fs-tab--active {
    background: var(--card);
    color: var(--purple);
    box-shadow: 0 1px 6px rgba(80,60,40,0.10);
  }

  .fs-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .fs-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .fs-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text);
  }
  .fs-input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--input-bg);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .fs-input::placeholder { color: #c4bdb4; }
  .fs-input:focus { border-color: var(--purple); background: #fff; }
  .fs-input--error { border-color: var(--error) !important; }
  .fs-input--icon { padding-right: 2.8rem; }
  .fs-input--code {
    letter-spacing: 0.4em;
    font-size: 1.4rem;
    font-weight: 600;
    text-align: center;
    color: var(--purple);
    padding: 0.8rem;
  }

  .fs-input-wrap { position: relative; }
  .fs-eye {
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-soft);
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .fs-eye:hover { color: var(--purple); }

  .fs-select {
    width: 100%;
    padding: 0.7rem 2.5rem 0.7rem 0.9rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--input-bg);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.15s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238875b0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
  }
  .fs-select:focus { border-color: var(--purple); background-color: #fff; }

  .fs-row { display: flex; align-items: center; }
  .fs-row--spread { justify-content: space-between; }
  .fs-row--cols2 { gap: 0.75rem; align-items: flex-start; }
  .fs-row--cols2 > * { flex: 1; min-width: 0; }

  .fs-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-soft);
    cursor: pointer;
    user-select: none;
    flex-wrap: wrap;
    line-height: 1.5;
  }
  .fs-checkbox {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: var(--purple);
    cursor: pointer;
  }

  .fs-hint {
    font-size: 0.78rem;
    color: var(--text-soft);
  }
  .fs-field-error {
    font-size: 0.78rem;
    color: var(--error);
  }

  .fs-error {
    font-size: 0.845rem;
    color: var(--error);
    background: #fdf0ef;
    border: 1px solid #f0c8c5;
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.875rem;
    line-height: 1.4;
  }
  .fs-success {
    font-size: 0.845rem;
    color: var(--success);
    background: #edf7f1;
    border: 1px solid #b2dcc3;
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.875rem;
    line-height: 1.4;
  }

  .fs-btn {
    width: 100%;
    padding: 0.82rem;
    background: var(--purple);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.975rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.15s, opacity 0.15s;
  }
  .fs-btn:hover:not(:disabled) { background: var(--purple-hover); }
  .fs-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .fs-btn-outline {
    width: 100%;
    padding: 0.78rem;
    background: transparent;
    color: var(--text-soft);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    margin-top: 0.5rem;
  }
  .fs-btn-outline:hover { border-color: var(--purple); color: var(--purple); }

  .fs-link {
    background: none;
    border: none;
    color: var(--purple);
    font-family: 'DM Sans', sans-serif;
    font-size: inherit;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .fs-link:hover { opacity: 0.72; text-decoration: underline; }

  .fs-footer-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-soft);
    margin-top: 0.25rem;
  }

  .fs-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: var(--text);
    font-weight: 400;
    margin-bottom: 0.15rem;
  }
  .fs-section-subtitle {
    font-size: 0.875rem;
    color: var(--text-soft);
    line-height: 1.55;
    margin-bottom: 0.25rem;
  }
  .fs-section-subtitle strong { color: var(--text); font-weight: 600; }

  .fs-verify-icon {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 0.25rem;
  }
  .fs-verify-links {
    display: flex;
    justify-content: space-between;
    margin-top: 0.875rem;
    font-size: 0.875rem;
  }
`
