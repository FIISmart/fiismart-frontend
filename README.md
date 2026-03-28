# FIISmart — Auth Module

Complete authentication module in React + TypeScript, ready to wire to the Java Spring Boot backend.

---

## File Structure

```
auth/
├── types/
│   └── auth.types.ts        # All TypeScript interfaces & enums
├── services/
│   └── auth.service.ts      # All HTTP calls to the backend
├── context/
│   └── AuthContext.tsx      # Global auth state (React Context + reducer)
├── hooks/                   # (add custom hooks here as needed)
├── utils/
│   └── validation.ts        # Pure form validation helpers
└── components/
    ├── AuthPage.tsx          # Combined Login + Signup + Forgot Password page
    └── ProtectedRoute.tsx    # Route guard + App wiring example
```

---

## Quick Start

### 1. Set backend URL

Create a `.env` file in Vite project root:

```
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Wrap app with `<AuthProvider>`

```tsx
// main.tsx
import { AuthProvider } from "./auth/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

### 3. Render the auth page

```tsx
import { AuthPage } from "./auth/components/AuthPage";
import { UserRole } from "./auth/types/auth.types";

<AuthPage
  onSuccess={(role) => {
    if (role === UserRole.TEACHER) navigate("/teacher/dashboard");
    else navigate("/student/dashboard");
  }}
/>
```

### 4. Protect routes

```tsx
import { ProtectedRoute } from "./auth/components/ProtectedRoute";

<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## Backend Contract

| Method | Endpoint                    | Purpose                         |
|--------|-----------------------------|---------------------------------|
| POST   | `/api/auth/login`           | Login, returns JWT tokens       |
| POST   | `/api/auth/register`        | Register, returns JWT tokens    |
| POST   | `/api/auth/logout`          | Invalidate session              |
| POST   | `/api/auth/refresh`         | Refresh access token            |
| POST   | `/api/auth/forgot-password` | Send password reset email       |
| POST   | `/api/auth/reset-password`  | Complete password reset         |
| POST   | `/api/auth/verify-email`    | Verify email from link          |
| GET    | `/api/auth/me`              | Return current user from token  |

### Expected Login/Register response shape

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "firstName": "Ana",
    "lastName": "Ionescu",
    "role": "STUDENT",
    "emailVerified": false,
    "createdAt": "2026-03-26T10:00:00Z"
  }
}
```

### Field validation errors from Spring

If Spring returns 400 with field errors, they should follow:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already in use"],
    "password": ["Password too short"]
  }
}
```

These are automatically mapped to the correct form fields.

---

