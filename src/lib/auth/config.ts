/** Auth backend selection — swap via env without code changes. */
export type AuthMode = 'local' | 'api'

export function getAuthMode(): AuthMode {
  const mode = import.meta.env.VITE_AUTH_MODE as string | undefined
  if (mode === 'api') return 'api'
  // Default local — npm run dev works without the Deno backend
  return 'local'
}

export function isLocalAuth() {
  return getAuthMode() === 'local'
}

export function isApiAuth() {
  return getAuthMode() === 'api'
}
