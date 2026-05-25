import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const JSON_HEADERS = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

async function readBody(res: ServerResponse, status: number, body: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(body)
}

function mediaSearchProxyMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const raw = req.url ?? ''
    const coverr = raw.match(/^\/wall-media-api\/coverr(\?.*)?$/)
    const pexelsV = raw.match(/^\/wall-media-api\/pexels-videos(\?.*)?$/)
    if (!coverr && !pexelsV) return next()

    const parsed = new URL(raw, 'http://127.0.0.1')

    void (async () => {
      try {
        if (coverr) {
          const q = parsed.searchParams.get('query') ?? parsed.searchParams.get('q') ?? 'nature'
          const pageSize = parsed.searchParams.get('page_size') ?? '12'
          const target = new URL('https://api.coverr.co/videos')
          target.searchParams.set('query', q)
          target.searchParams.set('page_size', pageSize)
          target.searchParams.set('page', parsed.searchParams.get('page') ?? '0')
          const upstream = await fetch(target.toString(), { headers: JSON_HEADERS })
          await readBody(res, upstream.status, await upstream.text())
          return
        }

        if (pexelsV) {
          const auth = req.headers.authorization
          if (!auth) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing Authorization' }))
            return
          }
          const q = parsed.searchParams.get('q') ?? ''
          const perPage = parsed.searchParams.get('per_page') ?? '12'
          const target = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${encodeURIComponent(perPage)}`
          const upstream = await fetch(target, {
            headers: { ...JSON_HEADERS, Authorization: auth },
          })
          await readBody(res, upstream.status, await upstream.text())
          return
        }
      } catch {
        await readBody(res, 502, JSON.stringify({ error: 'Media proxy failed' }))
      }
    })()
  }
}

export function wallMediaSearchProxyPlugin(): Plugin {
  return {
    name: 'wall-media-search-proxy',
    configureServer(server) {
      server.middlewares.use(mediaSearchProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(mediaSearchProxyMiddleware())
    },
  }
}
