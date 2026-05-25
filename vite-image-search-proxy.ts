import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const JSON_HEADERS = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

async function readBody(res: ServerResponse, status: number, body: string, contentType = 'application/json') {
  res.statusCode = status
  res.setHeader('Content-Type', contentType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(body)
}

function imageSearchProxyMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const raw = req.url ?? ''
    const match = raw.match(/^\/wall-img-api\/(wikimedia|pixabay|pexels|unsplash)(\?.*)?$/)
    if (!match) return next()

    const provider = match[1]
    const parsed = new URL(raw, 'http://127.0.0.1')

    void (async () => {
      try {
        if (provider === 'wikimedia') {
          const target = `https://commons.wikimedia.org/w/api.php${parsed.search}`
          const upstream = await fetch(target, { headers: JSON_HEADERS })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }

        if (provider === 'pixabay') {
          const key = req.headers['x-pixabay-key']
          if (!key || Array.isArray(key)) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing X-Pixabay-Key' }))
            return
          }
          const q = parsed.searchParams.get('q') ?? ''
          const perPage = parsed.searchParams.get('per_page') ?? '24'
          const target = new URL('https://pixabay.com/api/')
          target.searchParams.set('key', key)
          target.searchParams.set('q', q)
          target.searchParams.set('image_type', 'photo')
          target.searchParams.set('per_page', perPage)
          target.searchParams.set('safesearch', 'true')
          const upstream = await fetch(target.toString(), { headers: JSON_HEADERS })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }

        if (provider === 'pexels') {
          const auth = req.headers.authorization
          if (!auth) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing Authorization' }))
            return
          }
          const q = parsed.searchParams.get('q') ?? ''
          const perPage = parsed.searchParams.get('per_page') ?? '24'
          const target = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${encodeURIComponent(perPage)}`
          const upstream = await fetch(target, {
            headers: { ...JSON_HEADERS, Authorization: auth },
          })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }

        if (provider === 'unsplash') {
          const auth = req.headers.authorization
          if (!auth) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing Authorization' }))
            return
          }
          const query = parsed.searchParams.get('query') ?? parsed.searchParams.get('q') ?? ''
          const perPage = parsed.searchParams.get('per_page') ?? '24'
          const target = new URL('https://api.unsplash.com/search/photos')
          target.searchParams.set('query', query)
          target.searchParams.set('per_page', perPage)
          target.searchParams.set('content_filter', 'high')
          const upstream = await fetch(target.toString(), {
            headers: { ...JSON_HEADERS, Authorization: auth },
          })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }
      } catch {
        await readBody(res, 502, JSON.stringify({ error: 'Image proxy failed' }))
      }
    })()
  }
}

export function wallImageSearchProxyPlugin(): Plugin {
  return {
    name: 'wall-image-search-proxy',
    configureServer(server) {
      server.middlewares.use(imageSearchProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(imageSearchProxyMiddleware())
    },
  }
}
