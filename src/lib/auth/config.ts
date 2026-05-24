/** Auth backend selection — swap via env without code changes. */
export type AuthMode = 'local' | 'api'

export function getAuthMode(): AuthMode {
  const mode = import.meta.env.VITE_AUTH_MODE as string | undefined
  if (mode === 'api') return 'api'
  if (mode === 'local') return 'local'
  // Default: local when no API URL (offline-first dev)
  return import.meta.env.VITE_API_URL ? 'api' : 'local'
}

export function isLocalAuth() {
  return getAuthMode() === 'local'
}

export function isApiAuth() {
  return getAuthMode() === 'api'
}
