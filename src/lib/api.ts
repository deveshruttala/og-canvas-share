const API_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'wall_auth_token'

export type AuthUser = { id: string; username: string; email?: string }

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export type AgentToolCall = { id: string; name: string; arguments: Record<string, unknown> }

export type AiChatResponse = {
  message: string
  toolCalls: AgentToolCall[]
  assistantMessage: Record<string, unknown>
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  signup: (body: { username: string; password: string; email?: string }) =>
    request<{ user: AuthUser; token: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { username: string; password: string }) =>
    request<{ user: AuthUser; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<{ user: AuthUser }>('/auth/me'),

  aiChat: (body: { messages: Record<string, unknown>[]; canvasSummary: string }) =>
    request<AiChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify(body) }),

  getWall: async (username: string) => {
    if (!API_URL) return null
    try {
      return await request<import('@/types/canvas').CanvasDoc>(`/u/${username}`)
    } catch {
      return null
    }
  },

  saveWall: (username: string, doc: import('@/types/canvas').CanvasDoc) =>
    request(`/u/${username}`, { method: 'PUT', body: JSON.stringify(doc) }),

  createWidget: (body: import('@/types/widget-instance').WidgetInstance | Record<string, unknown>) =>
    request<import('@/types/widget-instance').WidgetInstance>('/w', { method: 'POST', body: JSON.stringify(body) }),

  getWidget: async (id: string) => {
    if (!API_URL) return null
    try {
      return await request<import('@/types/widget-instance').WidgetInstance>(`/w/${id}`)
    } catch {
      return null
    }
  },

  updateWidget: (id: string, patch: Partial<import('@/types/widget-instance').WidgetInstance>) =>
    request<import('@/types/widget-instance').WidgetInstance>(`/w/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),

  deleteWidget: (id: string) => request(`/w/${id}`, { method: 'DELETE' }),

  listMyWidgets: () => request<import('@/types/widget-instance').WidgetInstance[]>('/w/mine'),

  registerWebhook: (username: string, url: string) =>
    request(`/u/${username}/webhook`, { method: 'POST', body: JSON.stringify({ url }) }),
}

export function isApiConfigured() {
  return Boolean(API_URL)
}
