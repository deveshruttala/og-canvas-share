/**
 * Spotify OAuth PKCE (browser-only). Register redirect URI:
 * http://localhost:5173/oauth/spotify/callback (and your production origin).
 */
const STORAGE_KEY = 'wall_spotify_tokens_v1'
const SCOPES = ['user-read-currently-playing', 'user-read-playback-state', 'user-read-private'].join(
  ' ',
)

export type SpotifyTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

function getClientId(): string | undefined {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() || undefined
}

export function spotifyConfigured(): boolean {
  return Boolean(getClientId())
}

export function loadSpotifyTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SpotifyTokens) : null
  } catch {
    return null
  }
}

export function saveSpotifyTokens(tokens: SpotifyTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearSpotifyTokens() {
  localStorage.removeItem(STORAGE_KEY)
}

function randomString(len: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  const bytes = new Uint8Array(digest)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const PKCE_KEY = 'wall_spotify_pkce_v1'

export function startSpotifyLogin() {
  const clientId = getClientId()
  if (!clientId) throw new Error('Set VITE_SPOTIFY_CLIENT_ID in .env')

  const verifier = randomString(64)
  sessionStorage.setItem(PKCE_KEY, verifier)

  void sha256Base64Url(verifier).then((challenge) => {
    const redirectUri = `${window.location.origin}/oauth/spotify/callback`
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  })
}

export async function completeSpotifyLogin(code: string): Promise<void> {
  const clientId = getClientId()
  const verifier = sessionStorage.getItem(PKCE_KEY)
  if (!clientId || !verifier) throw new Error('Spotify login session expired')

  const redirectUri = `${window.location.origin}/oauth/spotify/callback`
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Spotify token exchange failed')

  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  saveSpotifyTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  })
  sessionStorage.removeItem(PKCE_KEY)
}

async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const clientId = getClientId()
  if (!clientId) throw new Error('Spotify not configured')

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Spotify refresh failed')

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  saveSpotifyTokens(tokens)
  return tokens
}

export async function getValidSpotifyAccessToken(): Promise<string | null> {
  const stored = loadSpotifyTokens()
  if (!stored) return null
  if (Date.now() < stored.expiresAt - 60_000) return stored.accessToken
  try {
    const refreshed = await refreshAccessToken(stored.refreshToken)
    return refreshed.accessToken
  } catch {
    clearSpotifyTokens()
    return null
  }
}

export type SpotifyNowPlaying = {
  title: string
  artist: string
  albumArt?: string
  isPlaying: boolean
  trackUrl?: string
}

export async function fetchSpotifyNowPlaying(): Promise<SpotifyNowPlaying | null> {
  const token = await getValidSpotifyAccessToken()
  if (!token) return null

  const res = await fetch('/wall-data-api/spotify/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) return null

  const data = (await res.json()) as {
    is_playing?: boolean
    item?: {
      name?: string
      external_urls?: { spotify?: string }
      album?: { images?: Array<{ url: string }> }
      artists?: Array<{ name: string }>
    }
  }

  const item = data.item
  if (!item?.name) return null

  return {
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(', ') ?? 'Unknown artist',
    albumArt: item.album?.images?.[0]?.url,
    isPlaying: Boolean(data.is_playing),
    trackUrl: item.external_urls?.spotify,
  }
}
