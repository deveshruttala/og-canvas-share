import { create } from 'zustand'
import { getAuthBackend, getAuthMode, isLocalAuth } from '@/lib/auth'
import { getAuthToken, setAuthToken } from '@/lib/api'

export type { AuthUser } from '@/lib/auth'

type AuthState = {
  user: import('@/lib/auth').AuthUser | null
  loading: boolean
  error: string | null
  mode: ReturnType<typeof getAuthMode>
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, email?: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  mode: getAuthMode(),

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const backend = getAuthBackend()
      const { user, token } = await backend.login(username, password)
      setAuthToken(token)
      set({ user, loading: false })
    } catch (e) {
      set({ error: formatAuthError(e, 'Login failed'), loading: false })
      throw e
    }
  },

  signup: async (username, password, email) => {
    set({ loading: true, error: null })
    try {
      const backend = getAuthBackend()
      const { user, token } = await backend.signup(username, password, email)
      setAuthToken(token)
      set({ user, loading: false })
    } catch (e) {
      set({ error: formatAuthError(e, 'Signup failed'), loading: false })
      throw e
    }
  },

  logout: () => {
    const token = getAuthToken()
    void getAuthBackend().logout(token)
    setAuthToken(null)
    set({ user: null })
  },

  fetchMe: async () => {
    const token = getAuthToken()
    const user = await getAuthBackend().me(token)
    if (!user) {
      setAuthToken(null)
      set({ user: null })
      return
    }
    set({ user })
  },
}))

function formatAuthError(e: unknown, fallback: string): string {
  if (!(e instanceof Error)) return fallback
  const msg = e.message
  if (msg === 'NetworkError when attempting to fetch resource.' || msg.includes('Failed to fetch')) {
    return 'Cannot reach the API server. Use local auth (VITE_AUTH_MODE=local) or start the backend on port 8000.'
  }
  return msg || fallback
}

export { isLocalAuth }
