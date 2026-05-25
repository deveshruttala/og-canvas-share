/** Asset + API proxies for production when the Deno API is used without nginx. */

const MAX_BYTES = 12 * 1024 * 1024

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local') || h === '0.0.0.0') return true
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (!m) return false
  const a = Number(m[1])
  const b = Number(m[2])
  if (a === 127 || a === 10) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}

export function isAllowedProxyUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return !isPrivateHost(u.hostname)
  } catch {
    return false
  }
}

export async function proxyAssetUrl(
  target: string,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  if (!isAllowedProxyUrl(target)) {
    return new Response('Invalid URL', { status: 400, headers: cors() })
  }
  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      headers: { 'User-Agent': 'WallCanvas/1.0', Accept: 'image/*,*/*;q=0.8' },
    })
    const buf = await upstream.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) {
      return new Response('Too large', { status: 413, headers: cors() })
    }
    const headers = cors(new Headers())
    const ct = upstream.headers.get('content-type')
    if (ct) headers.set('Content-Type', ct)
    headers.set('Cache-Control', 'public, max-age=86400')
    return new Response(buf, { status: upstream.status, headers })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

export async function proxyOpenverse(
  pathAndQuery: string,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  const target = `https://api.openverse.org${pathAndQuery}`
  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      headers: { 'User-Agent': 'WallCanvas/1.0', Accept: 'application/json' },
    })
    const body = await upstream.text()
    const headers = cors(new Headers({ 'Content-Type': 'application/json' }))
    return new Response(body, { status: upstream.status, headers })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

export async function proxyMicrolink(
  search: string,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  const target = `https://api.microlink.io/${search.startsWith('?') ? '' : '/'}${search}`
  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'WallCanvas/1.0', Accept: 'application/json' },
    })
    const body = await upstream.text()
    const headers = cors(new Headers({ 'Content-Type': 'application/json' }))
    return new Response(body, { status: upstream.status, headers })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

const JSON_ACCEPT = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

/** Image search proxies — mirrors vite-image-search-proxy.ts */
export async function proxyWallImageSearch(
  provider: string,
  search: string,
  req: Request,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  try {
    if (provider === 'wikimedia') {
      const target = `https://commons.wikimedia.org/w/api.php${search}`
      const upstream = await fetch(target, { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    const url = new URL(search.startsWith('?') ? `http://x${search}` : `http://x/?${search}`)

    if (provider === 'pixabay') {
      const key = req.headers.get('x-pixabay-key')
      if (!key) return new Response(JSON.stringify({ error: 'Missing X-Pixabay-Key' }), { status: 401, headers: cors() })
      const target = new URL('https://pixabay.com/api/')
      target.searchParams.set('key', key)
      target.searchParams.set('q', url.searchParams.get('q') ?? '')
      target.searchParams.set('image_type', 'photo')
      target.searchParams.set('per_page', url.searchParams.get('per_page') ?? '24')
      target.searchParams.set('safesearch', 'true')
      const upstream = await fetch(target.toString(), { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    if (provider === 'pexels') {
      const auth = req.headers.get('authorization')
      if (!auth) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors() })
      const q = url.searchParams.get('q') ?? ''
      const perPage = url.searchParams.get('per_page') ?? '24'
      const target = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${encodeURIComponent(perPage)}`
      const upstream = await fetch(target, { headers: { ...JSON_ACCEPT, Authorization: auth } })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    if (provider === 'unsplash') {
      const auth = req.headers.get('authorization')
      if (!auth) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors() })
      const target = new URL('https://api.unsplash.com/search/photos')
      target.searchParams.set('query', url.searchParams.get('query') ?? url.searchParams.get('q') ?? '')
      target.searchParams.set('per_page', url.searchParams.get('per_page') ?? '24')
      target.searchParams.set('content_filter', 'high')
      const upstream = await fetch(target, { headers: { ...JSON_ACCEPT, Authorization: auth } })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    return new Response('Unknown provider', { status: 404, headers: cors() })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

/** Spotify + Strava API forward (browser tokens). */
export async function proxyWallDataApi(
  service: string,
  apiPath: string,
  search: string,
  req: Request,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  const auth = req.headers.get('authorization')
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors() })
  }
  try {
    if (service === 'spotify') {
      const target = `https://api.spotify.com/v1/${apiPath}${search}`
      const upstream = await fetch(target, { headers: { ...JSON_ACCEPT, Authorization: auth } })
      const body = await upstream.text()
      return new Response(body || '{}', {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }
    if (service === 'strava') {
      const target = `https://www.strava.com/api/v3/${apiPath}${search}`
      const upstream = await fetch(target, { headers: { ...JSON_ACCEPT, Authorization: auth } })
      const body = await upstream.text()
      return new Response(body || '[]', {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }
    return new Response('Unknown service', { status: 404, headers: cors() })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

/** Audio search proxies — mirrors vite-audio-search-proxy.ts */
export async function proxyWallAudioSearch(
  provider: string,
  search: string,
  req: Request,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  try {
    const url = new URL(search.startsWith('?') ? `http://x${search}` : `http://x/?${search}`)

    if (provider === 'pixabay') {
      const key = req.headers.get('x-pixabay-key')
      if (!key) return new Response(JSON.stringify({ error: 'Missing X-Pixabay-Key' }), { status: 401, headers: cors() })
      const target = new URL('https://pixabay.com/api/audio/')
      target.searchParams.set('key', key)
      target.searchParams.set('q', url.searchParams.get('q') ?? '')
      target.searchParams.set('per_page', url.searchParams.get('per_page') ?? '12')
      const upstream = await fetch(target.toString(), { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    if (provider === 'jamendo') {
      const clientId = url.searchParams.get('client_id')
      if (!clientId) {
        return new Response(JSON.stringify({ error: 'Missing client_id' }), { status: 401, headers: cors() })
      }
      const target = new URL('https://api.jamendo.com/v3.0/tracks/')
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v)
      const upstream = await fetch(target.toString(), { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    if (provider === 'freesound') {
      const token = req.headers.get('x-freesound-token')
      if (!token) {
        return new Response(JSON.stringify({ error: 'Missing X-Freesound-Token' }), { status: 401, headers: cors() })
      }
      const target = new URL('https://freesound.org/apiv2/search/text/')
      target.searchParams.set('query', url.searchParams.get('q') ?? '')
      target.searchParams.set('fields', 'id,name,previews,duration,username')
      target.searchParams.set('filter', 'license:"Creative Commons 0"')
      target.searchParams.set('token', token)
      target.searchParams.set('page_size', url.searchParams.get('page_size') ?? '8')
      const upstream = await fetch(target.toString(), { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    return new Response('Unknown provider', { status: 404, headers: cors() })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}

/** Stock video search — Coverr + Pexels videos (mirrors vite-media-search-proxy.ts). */
export async function proxyWallMediaSearch(
  provider: string,
  search: string,
  req: Request,
  cors: (h?: Headers) => Headers,
): Promise<Response> {
  try {
    const url = new URL(search.startsWith('?') ? `http://x${search}` : `http://x/?${search}`)

    if (provider === 'coverr') {
      const target = new URL('https://api.coverr.co/videos')
      target.searchParams.set('query', url.searchParams.get('query') ?? url.searchParams.get('q') ?? 'nature')
      target.searchParams.set('page_size', url.searchParams.get('page_size') ?? '12')
      target.searchParams.set('page', url.searchParams.get('page') ?? '0')
      const upstream = await fetch(target.toString(), { headers: JSON_ACCEPT })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    if (provider === 'pexels-videos') {
      const auth = req.headers.get('authorization')
      if (!auth) {
        return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors() })
      }
      const q = url.searchParams.get('q') ?? ''
      const perPage = url.searchParams.get('per_page') ?? '12'
      const target = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${encodeURIComponent(perPage)}`
      const upstream = await fetch(target, { headers: { ...JSON_ACCEPT, Authorization: auth } })
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: cors(new Headers({ 'Content-Type': 'application/json' })),
      })
    }

    return new Response('Unknown provider', { status: 404, headers: cors() })
  } catch {
    return new Response('Proxy failed', { status: 502, headers: cors() })
  }
}
