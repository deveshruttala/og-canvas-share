import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const JSON_HEADERS = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

async function readBody(res: ServerResponse, status: number, body: string, contentType = 'application/json') {
  res.statusCode = status
  res.setHeader('Content-Type', contentType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(body)
}

function audioSearchProxyMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const raw = req.url ?? ''
    const match = raw.match(/^\/wall-audio-api\/(pixabay|freesound|jamendo)(\?.*)?$/)
    if (!match) return next()

    const provider = match[1]
    const parsed = new URL(raw, 'http://127.0.0.1')

    void (async () => {
      try {
        if (provider === 'pixabay') {
          const key = req.headers['x-pixabay-key']
          if (!key || Array.isArray(key)) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing X-Pixabay-Key' }))
            return
          }
          const q = parsed.searchParams.get('q') ?? ''
          const perPage = parsed.searchParams.get('per_page') ?? '12'
          const target = new URL('https://pixabay.com/api/audio/')
          target.searchParams.set('key', key)
          target.searchParams.set('q', q)
          target.searchParams.set('per_page', perPage)
          const upstream = await fetch(target.toString(), { headers: JSON_HEADERS })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }

        if (provider === 'freesound') {
          const token = req.headers['x-freesound-token']
          if (!token || Array.isArray(token)) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing X-Freesound-Token' }))
            return
          }
          const q = parsed.searchParams.get('q') ?? ''
          const pageSize = parsed.searchParams.get('page_size') ?? '8'
          const target = new URL('https://freesound.org/apiv2/search/text/')
          target.searchParams.set('query', q)
          target.searchParams.set(
            'fields',
            'id,name,previews,duration,username',
          )
          target.searchParams.set('filter', 'license:"Creative Commons 0"')
          target.searchParams.set('token', token)
          target.searchParams.set('page_size', pageSize)
          const upstream = await fetch(target.toString(), { headers: JSON_HEADERS })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }

        if (provider === 'jamendo') {
          const clientId = parsed.searchParams.get('client_id')
          if (!clientId) {
            await readBody(res, 401, JSON.stringify({ error: 'Missing client_id' }))
            return
          }
          const target = new URL('https://api.jamendo.com/v3.0/tracks/')
          for (const [k, v] of parsed.searchParams) target.searchParams.set(k, v)
          const upstream = await fetch(target.toString(), { headers: JSON_HEADERS })
          const text = await upstream.text()
          await readBody(res, upstream.status, text)
          return
        }
      } catch {
        await readBody(res, 502, JSON.stringify({ error: 'Audio proxy failed' }))
      }
    })()
  }
}

export function wallAudioSearchProxyPlugin(): Plugin {
  return {
    name: 'wall-audio-search-proxy',
    configureServer(server) {
      server.middlewares.use(audioSearchProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(audioSearchProxyMiddleware())
    },
  }
}
