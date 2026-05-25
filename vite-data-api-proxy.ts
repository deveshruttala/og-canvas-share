import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

const JSON_HEADERS = { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' }

async function readBody(res: ServerResponse, status: number, body: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(body)
}

function dataApiProxyMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const raw = req.url ?? ''
    const spotify = raw.match(/^\/wall-data-api\/spotify\/(.+)$/)
    const strava = raw.match(/^\/wall-data-api\/strava\/(.+)$/)
    if (!spotify && !strava) return next()

    const auth = req.headers.authorization
    if (!auth) {
      void readBody(res, 401, JSON.stringify({ error: 'Missing Authorization' }))
      return
    }

    void (async () => {
      try {
        if (spotify) {
          const path = spotify[1]!
          const target = `https://api.spotify.com/v1/${path}`
          const upstream = await fetch(target, { headers: { ...JSON_HEADERS, Authorization: auth } })
          const text = await upstream.text()
          await readBody(res, upstream.status, text || '{}')
          return
        }

        if (strava) {
          const path = strava[1]!
          const parsed = new URL(raw, 'http://127.0.0.1')
          const qs = parsed.search
          const target = `https://www.strava.com/api/v3/${path}${qs}`
          const upstream = await fetch(target, { headers: { ...JSON_HEADERS, Authorization: auth } })
          const text = await upstream.text()
          await readBody(res, upstream.status, text || '[]')
        }
      } catch {
        await readBody(res, 502, JSON.stringify({ error: 'Data proxy failed' }))
      }
    })()
  }
}

export function wallDataApiProxyPlugin(): Plugin {
  return {
    name: 'wall-data-api-proxy',
    configureServer(server) {
      server.middlewares.use(dataApiProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(dataApiProxyMiddleware())
    },
  }
}
