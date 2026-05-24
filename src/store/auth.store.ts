import { create } from 'zustand'
import { api, setAuthToken, type AuthUser } from '@/lib/api'

const LOCAL_SESSION_KEY = 'wall_local_session'

type AuthState = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, email?: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

function loadLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function saveLocalUser(user: AuthUser | null) {
  if (user) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(LOCAL_SESSION_KEY)
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      if (import.meta.env.VITE_API_URL) {
        const { user, token } = await api.login({ username, password })
        setAuthToken(token)
        set({ user, loading: false })
        return
      }
      const user: AuthUser = { id: `local-${username}`, username }
      setAuthToken('local-dev')
      saveLocalUser(user)
      set({ user, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Login failed', loading: false })
      throw e
    }
  },

  signup: async (username, password, email) => {
    set({ loading: true, error: null })
    try {
      if (import.meta.env.VITE_API_URL) {
        const { user, token } = await api.signup({ username, password, email })
        setAuthToken(token)
        set({ user, loading: false })
        return
      }
      const user: AuthUser = { id: `local-${username}`, username, email }
      setAuthToken('local-dev')
      saveLocalUser(user)
      set({ user, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Signup failed', loading: false })
      throw e
    }
  },

  logout: () => {
    setAuthToken(null)
    saveLocalUser(null)
    set({ user: null })
  },

  fetchMe: async () => {
    if (!import.meta.env.VITE_API_URL) {
      set({ user: loadLocalUser() })
      return
    }
    try {
      const { user } = await api.me()
      set({ user })
    } catch {
      setAuthToken(null)
      saveLocalUser(null)
      set({ user: null })
    }
  },
}))
