import { api } from '@/lib/api'
import type { AuthBackend } from '@/lib/auth/types'

export const apiAuth: AuthBackend = {
  signup: (username, password, email) => api.signup({ username, password, email }),
  login: (username, password) => api.login({ username, password }),
  async me(token) {
    if (!token) return null
    try {
      const { user } = await api.me()
      return user
    } catch {
      return null
    }
  },
  async logout() {
    /* API sessions expire server-side; client clears token */
  },
}
