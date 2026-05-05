import { cognitoConfig } from "@/lib/cognito-config";

const PKCE_VERIFIER_KEY = "cognito_pkce_verifier";
const PKCE_STATE_KEY = "cognito_pkce_state";

// ── PKCE helpers ─────────────────────────────────────────────────────────────

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function randomString(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer).slice(0, length);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate PKCE verifier/challenge, store the verifier in sessionStorage, and
 * return the Cognito Hosted UI authorization URL. Redirect the user to it.
 */
export async function buildLoginUrl(): Promise<string> {
  const verifier = randomString(64);
  const state = randomString(32);
  const challengeBuffer = await sha256(verifier);
  const challenge = base64UrlEncode(challengeBuffer);

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: cognitoConfig.clientId,
    redirect_uri: cognitoConfig.redirectUri,
    scope: "openid email profile",
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  return `https://${cognitoConfig.domain}/oauth2/authorize?${params}`;
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Exchange the authorization code received at /auth/callback for tokens.
 * Validates the state parameter to prevent CSRF.
 */
export async function exchangeCode(
  code: string,
  returnedState: string
): Promise<CognitoTokens> {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  const savedState = sessionStorage.getItem(PKCE_STATE_KEY);

  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);

  if (!verifier) throw new Error("PKCE verifier missing — restart the login flow.");
  if (savedState && returnedState !== savedState) {
    throw new Error("State mismatch — possible CSRF. Restart the login flow.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: cognitoConfig.clientId,
    redirect_uri: cognitoConfig.redirectUri,
    code,
    code_verifier: verifier,
  });

  const res = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description ?? `Token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 3600,
  };
}

/**
 * Use the Cognito refresh token to silently obtain a new access token.
 * Returns null when the refresh token is expired/invalid.
 */
export async function refreshCognitoTokens(
  refreshToken: string
): Promise<CognitoTokens | null> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: cognitoConfig.clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: refreshToken,
    expiresIn: data.expires_in ?? 3600,
  };
}
