const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID ?? "";
const domain = import.meta.env.VITE_COGNITO_DOMAIN ?? "";

// Default to the current page's origin so Google OAuth survives every
// deployment target (localhost, Vercel prod, preview, custom domains)
// without per-env configuration. Only override via VITE_COGNITO_REDIRECT_URI
// if you have a specific reason (e.g. forcing a canonical callback origin).
// IMPORTANT: every origin used here must also be listed under Cognito App
// Client's "Allowed callback URLs".
const defaultRedirectUri =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "http://localhost:3000/auth/callback";
const redirectUri =
  import.meta.env.VITE_COGNITO_REDIRECT_URI ?? defaultRedirectUri;

function missingOrPlaceholder(v: string) {
  return !v || v.includes("REPLACE_ME");
}

export const isCognitoConfigured =
  !missingOrPlaceholder(userPoolId) &&
  !missingOrPlaceholder(clientId) &&
  !missingOrPlaceholder(domain);

export const cognitoConfig = {
  userPoolId,
  clientId,
  domain,
  redirectUri,
  region: userPoolId.split("_")[0] || "eu-central-1",
};
