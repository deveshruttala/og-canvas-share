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
