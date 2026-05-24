import { create } from 'zustand'
import { api, setAuthToken, type AuthUser } from '@/lib/api'

type AuthState = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, email?: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.login({ username, password })
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
      const { user, token } = await api.signup({ username, password, email })
      setAuthToken(token)
      set({ user, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Signup failed', loading: false })
      throw e
    }
  },

  logout: () => {
    setAuthToken(null)
    set({ user: null })
  },

  fetchMe: async () => {
    if (!import.meta.env.VITE_API_URL) return
    try {
      const { user } = await api.me()
      set({ user })
    } catch {
      setAuthToken(null)
      set({ user: null })
    }
  },
}))
