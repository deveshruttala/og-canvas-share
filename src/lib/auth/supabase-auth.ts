/**
 * Supabase Auth backend — implements AuthBackend over Supabase's email/password
 * + magic-link flow. Username is stored in user_metadata.username so we can keep
 * the same /u/:username URL contract that `local` and `api` modes use.
 */
import type { AuthBackend, AuthResult, AuthUser } from '@/lib/auth/types'
import { getSupabaseClient } from '@/lib/supabase'

function requireClient() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
    )
  }
  return supabase
}

/** Map a Supabase user → wall-app AuthUser (uses metadata.username if present). */
function toAuthUser(u: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}): AuthUser {
  const meta = u.user_metadata ?? {}
  const username =
    typeof meta.username === 'string' && meta.username.length > 0
      ? meta.username
      : u.email
        ? u.email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        : u.id.slice(0, 8)
  return {
    id: u.id,
    username,
    email: u.email ?? undefined,
  }
}

/**
 * Supabase auth uses email/password. Since the app's signup form takes a
 * `username`, we synthesize a deterministic email under a "wall.local"
 * pseudo-domain when the user doesn't supply one (or use the real email if
 * they did). Real production deployments should require a real email.
 */
function deriveEmail(username: string, providedEmail?: string): string {
  if (providedEmail && providedEmail.includes('@')) return providedEmail
  const safe = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  return `${safe}@wall.local`
}

export const supabaseAuth: AuthBackend = {
  async signup(username, password, email) {
    const supabase = requireClient()
    const finalEmail = deriveEmail(username, email)
    const { data, error } = await supabase.auth.signUp({
      email: finalEmail,
      password,
      options: { data: { username } },
    })
    if (error) throw new Error(error.message)
    const session = data.session
    const user = data.user
    if (!user) throw new Error('Signup did not return a user')
    if (!session) {
      // Email confirmation required → finish login manually so the app has
      // a session immediately (works when "Confirm email" is OFF in Supabase).
      const loginResult = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      })
      if (loginResult.error) throw new Error(loginResult.error.message)
      const tok = loginResult.data.session?.access_token ?? ''
      return { user: toAuthUser(loginResult.data.user!), token: tok }
    }
    return { user: toAuthUser(user), token: session.access_token }
  },

  async login(username, password) {
    const supabase = requireClient()
    // Try username as email first; fall back to synthesized email used at signup.
    const candidates = [username, deriveEmail(username)]
    let lastError: string | null = null
    for (const email of candidates) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        lastError = error.message
        continue
      }
      if (!data.session || !data.user) {
        lastError = 'No session returned'
        continue
      }
      return { user: toAuthUser(data.user), token: data.session.access_token }
    }
    throw new Error(lastError ?? 'Invalid credentials')
  },

  async me() {
    const supabase = requireClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return toAuthUser(data.user)
  },

  async logout() {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
  },
}
