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
      set({ error: e instanceof Error ? e.message : 'Login failed', loading: false })
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
      set({ error: e instanceof Error ? e.message : 'Signup failed', loading: false })
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

export { isLocalAuth }
