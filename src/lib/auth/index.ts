import { getAuthMode } from '@/lib/auth/config'
import { localAuth } from '@/lib/auth/local-auth'
import { apiAuth } from '@/lib/auth/api-auth'
import type { AuthBackend } from '@/lib/auth/types'

export type { AuthUser, AuthResult, AuthBackend } from '@/lib/auth/types'
export { getAuthMode, isLocalAuth, isApiAuth } from '@/lib/auth/config'

export function getAuthBackend(): AuthBackend {
  return getAuthMode() === 'api' ? apiAuth : localAuth
}
