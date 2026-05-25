import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const MAX_BYTES = 12 * 1024 * 1024

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local')) return true
  if (h === '0.0.0.0') return true
  const ipv4 = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (!ipv4) return false
  const [, a, b] = ipv4.map(Number)
  if (a === 127) return true
  if (a === 10) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}

function isAllowedTarget(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return !isPrivateHost(u.hostname)
  } catch {
    return false
  }
}

async function pipeProxyResponse(
  target: string,
  res: ServerResponse,
  init?: RequestInit,
): Promise<void> {
  const upstream = await fetch(target, {
    redirect: 'follow',
    ...init,
    headers: {
      'User-Agent': 'WallCanvas/1.0',
      Accept: 'image/*,application/json,*/*;q=0.8',
      ...(init?.headers ?? {}),
    },
  })

  const buf = await upstream.arrayBuffer()
  if (buf.byteLength > MAX_BYTES) {
    res.statusCode = 413
    res.end('Asset too large')
    return
  }

  res.statusCode = upstream.status
  const ct = upstream.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(Buffer.from(buf))
}

function assetProxyMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const url = req.url ?? ''
    if (!url.startsWith('/asset-proxy')) return next()

    const parsed = new URL(url, 'http://127.0.0.1')
    const target = parsed.searchParams.get('url')
    if (!target || !isAllowedTarget(target)) {
      res.statusCode = 400
      res.end('Invalid or disallowed URL')
      return
    }

    void pipeProxyResponse(target, res).catch(() => {
      res.statusCode = 502
      res.end('Proxy failed')
    })
  }
}

export function wallProxyPlugin(): Plugin {
  return {
    name: 'wall-asset-proxy',
    configureServer(server) {
      server.middlewares.use(assetProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(assetProxyMiddleware())
    },
  }
}
