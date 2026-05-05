const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID ?? "";
const domain = import.meta.env.VITE_COGNITO_DOMAIN ?? "";
const redirectUri =
  import.meta.env.VITE_COGNITO_REDIRECT_URI ?? "http://localhost:3000/auth/callback";

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
