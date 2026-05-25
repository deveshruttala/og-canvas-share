import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const JSON_HEADERS = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

const INVIDIOUS_BASES = [
  'https://yewtu.be',
  'https://invidious.privacydev.net',
  'https://invidious.nerdvpn.de',
]

async function readBody(res: ServerResponse, status: number, body: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(body)
}

async function searchYouTube(q: string) {
  for (const base of INVIDIOUS_BASES) {
    try {
      const target = `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video`
      const res = await fetch(target, { headers: JSON_HEADERS, signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const data = (await res.json()) as Array<{
        videoId?: string
        title?: string
        author?: string
        lengthSeconds?: number
        videoThumbnails?: Array<{ url?: string; quality?: string }>
      }>
      if (!Array.isArray(data) || data.length === 0) continue
      return data
        .filter((v) => v.videoId && v.title)
        .slice(0, 10)
        .map((v) => ({
          videoId: v.videoId!,
          title: v.title!,
          author: v.author ?? 'YouTube',
          lengthSeconds: v.lengthSeconds,
          thumbnail:
            v.videoThumbnails?.find((t) => t.quality === 'medium')?.url ??
            v.videoThumbnails?.[0]?.url,
        }))
    } catch {
      continue
    }
  }
  return []
}

let spotifyTokenCache: { token: string; expires: number } | null = null

async function getSpotifyAppToken(clientId: string, clientSecret: string): Promise<string | null> {
  if (spotifyTokenCache && spotifyTokenCache.expires > Date.now()) {
    return spotifyTokenCache.token
  }
  const body = new URLSearchParams({ grant_type: 'client_credentials' })
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) return null
  spotifyTokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
  }
  return data.access_token
}

async function searchSpotify(q: string, clientId: string, clientSecret: string) {
  const token = await getSpotifyAppToken(clientId, clientSecret)
  if (!token) return []
  const target = new URL('https://api.spotify.com/v1/search')
  target.searchParams.set('q', q)
  target.searchParams.set('type', 'track')
  target.searchParams.set('limit', '8')
  const res = await fetch(target.toString(), {
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return []
  const data = (await res.json()) as {
    tracks?: {
      items?: Array<{
        id: string
        name: string
        external_urls?: { spotify?: string }
        artists?: Array<{ name?: string }>
        album?: { images?: Array<{ url?: string }> }
      }>
    }
  }
  return (data.tracks?.items ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a) => a.name).filter(Boolean).join(', ') ?? 'Spotify',
    url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
    cover: t.album?.images?.[0]?.url,
  }))
}

function musicSearchMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const raw = req.url ?? ''
    const yt = raw.match(/^\/wall-music-api\/youtube(\?.*)?$/)
    const sp = raw.match(/^\/wall-music-api\/spotify(\?.*)?$/)
    if (!yt && !sp) return next()

    const parsed = new URL(raw, 'http://127.0.0.1')
    const q = parsed.searchParams.get('q')?.trim() ?? ''
    if (q.length < 2) {
      void readBody(res, 400, JSON.stringify({ error: 'Query too short' }))
      return
    }

    void (async () => {
      try {
        if (yt) {
          const items = await searchYouTube(q)
          await readBody(res, 200, JSON.stringify({ items }))
          return
        }
        const clientId = process.env.VITE_SPOTIFY_CLIENT_ID ?? process.env.SPOTIFY_CLIENT_ID
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
        if (!clientId || !clientSecret) {
          await readBody(res, 200, JSON.stringify({ items: [], configured: false }))
          return
        }
        const items = await searchSpotify(q, clientId, clientSecret)
        await readBody(res, 200, JSON.stringify({ items, configured: true }))
      } catch {
        await readBody(res, 502, JSON.stringify({ error: 'Music search failed' }))
      }
    })()
  }
}

export function wallMusicSearchProxyPlugin(): Plugin {
  return {
    name: 'wall-music-search-proxy',
    configureServer(server) {
      server.middlewares.use(musicSearchMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(musicSearchMiddleware())
    },
  }
}
