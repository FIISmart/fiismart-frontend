const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID ?? "";
const domain = import.meta.env.VITE_COGNITO_DOMAIN ?? "";
const explicitRedirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI as
  | string
  | undefined;

function missingOrPlaceholder(v: string) {
  return !v || v.includes("REPLACE_ME");
}

export const isCognitoConfigured =
  !missingOrPlaceholder(userPoolId) &&
  !missingOrPlaceholder(clientId) &&
  !missingOrPlaceholder(domain);

/**
 * Resolve the OAuth callback URL at call time.
 *
 * We can NOT bake this into a top-level constant because Vite's esbuild
 * statically evaluates `typeof window` at build time and tree-shakes the
 * browser branch away. Computing on demand guarantees the real
 * window.location.origin is used at runtime — so the callback always
 * matches whatever host the user is on (localhost, Vercel prod, previews,
 * custom domains).
 *
 * Override with VITE_COGNITO_REDIRECT_URI only if you need to force a
 * specific canonical origin. Every origin used must also be listed under
 * Cognito App Client's "Allowed callback URLs".
 */
export function getCognitoRedirectUri(): string {
  if (explicitRedirectUri) return explicitRedirectUri;
  return `${window.location.origin}/auth/callback`;
}

export const cognitoConfig = {
  userPoolId,
  clientId,
  domain,
  /** @deprecated prefer getCognitoRedirectUri() — this is a snapshot only. */
  get redirectUri() {
    return getCognitoRedirectUri();
  },
  region: userPoolId.split("_")[0] || "eu-central-1",
};
