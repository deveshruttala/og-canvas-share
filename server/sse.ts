/** In-memory SSE subscribers per subject key (wall or widget). */

type Subscriber = {
  controller: ReadableStreamDefaultController<string>
  closed: boolean
}

const channels = new Map<string, Set<Subscriber>>()
const MAX_PER_CHANNEL = 100

function channelKey(scope: 'wall' | 'widget', id: string): string {
  return `${scope}:${id}`
}

export function subscribe(scope: 'wall' | 'widget', id: string): ReadableStream<string> {
  const key = channelKey(scope, id)
  let set = channels.get(key)
  if (!set) {
    set = new Set()
    channels.set(key, set)
  }

  if (set.size >= MAX_PER_CHANNEL) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(`event: mode\ndata: {"mode":"poll"}\n\n`)
        controller.close()
      },
    })
  }

  return new ReadableStream({
    start(controller) {
      const sub: Subscriber = { controller, closed: false }
      set!.add(sub)

      controller.enqueue(`event: connected\ndata: {"ok":true}\n\n`)

      const heartbeat = setInterval(() => {
        if (sub.closed) {
          clearInterval(heartbeat)
          return
        }
        try {
          controller.enqueue(`event: heartbeat\ndata: {"t":${Math.floor(Date.now() / 1000)}}\n\n`)
        } catch {
          sub.closed = true
          clearInterval(heartbeat)
        }
      }, 25_000)
    },
    cancel() {
      for (const sub of set!) {
        sub.closed = true
      }
    },
  })
}

export function broadcast(scope: 'wall' | 'widget', id: string, event: string, data: unknown) {
  const key = channelKey(scope, id)
  const set = channels.get(key)
  if (!set) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const sub of set) {
    if (sub.closed) continue
    try {
      sub.controller.enqueue(payload)
    } catch {
      sub.closed = true
      set.delete(sub)
    }
  }
}

export function sseResponse(stream: ReadableStream<string>, corsHeaders: Headers): Response {
  const headers = new Headers(corsHeaders)
  headers.set('Content-Type', 'text/event-stream')
  headers.set('Cache-Control', 'no-cache')
  headers.set('Connection', 'keep-alive')
  return new Response(stream, { headers })
}

export async function sendSnapshot(scope: 'wall' | 'widget', id: string, doc: unknown) {
  broadcast(scope, id, 'snapshot', doc)
}

export function sendUpdate(scope: 'wall' | 'widget', id: string, changedFields: string[], values: Record<string, unknown>) {
  broadcast(scope, id, 'update', { changedFields, values })
}

export function sendReaction(scope: 'wall' | 'widget', id: string, emoji: string, count: number) {
  broadcast(scope, id, 'reaction', { emoji, count })
}
