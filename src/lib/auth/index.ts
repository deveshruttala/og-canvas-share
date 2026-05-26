import { getAuthMode } from '@/lib/auth/config'
import { localAuth } from '@/lib/auth/local-auth'
import { apiAuth } from '@/lib/auth/api-auth'
import { supabaseAuth } from '@/lib/auth/supabase-auth'
import type { AuthBackend } from '@/lib/auth/types'

export type { AuthUser, AuthResult, AuthBackend } from '@/lib/auth/types'
export { getAuthMode, isLocalAuth, isApiAuth, isSupabaseAuth } from '@/lib/auth/config'

export function getAuthBackend(): AuthBackend {
  const mode = getAuthMode()
  if (mode === 'api') return apiAuth
  if (mode === 'supabase') return supabaseAuth
  return localAuth
}
