export type WallLiveHandle = {
  onUpdate: (cb: (data: unknown) => void) => () => void
  react: (emoji: string) => Promise<void>
  close: () => void
}

export async function connectWall(username: string, baseUrl = 'https://wall.app'): Promise<WallLiveHandle> {
  const discovery = await fetch(`${baseUrl}/u/${username}/.well-known/walllive`).then((r) => r.json()) as {
    renders: { data_json: string }
    streams: { sse: string }
    actions?: { react?: { url: string } }
  }

  const listeners = new Set<(data: unknown) => void>()
  let es: EventSource | null = null

  try {
    es = new EventSource(discovery.streams.sse)
    es.addEventListener('snapshot', (e) => {
      const data = JSON.parse((e as MessageEvent).data)
      listeners.forEach((cb) => cb(data))
    })
    es.addEventListener('update', async () => {
      const data = await fetch(discovery.renders.data_json).then((r) => r.json())
      listeners.forEach((cb) => cb(data))
    })
  } catch {
    /* polling fallback */
  }

  const initial = await fetch(discovery.renders.data_json).then((r) => r.json())
  listeners.forEach((cb) => cb(initial))

  return {
    onUpdate(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    async react(emoji) {
      const url = discovery.actions?.react?.url
      if (!url) return
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }) })
    },
    close() {
      es?.close()
      listeners.clear()
    },
  }
}

export async function connectWidget(widgetId: string, baseUrl = 'https://wall.app'): Promise<WallLiveHandle> {
  const discovery = await fetch(`${baseUrl}/w/${widgetId}/.well-known/walllive`).then((r) => r.json()) as {
    renders: { data_json: string }
    streams: { sse: string }
  }

  const listeners = new Set<(data: unknown) => void>()
  let es: EventSource | null = null

  try {
    es = new EventSource(discovery.streams.sse)
    es.addEventListener('snapshot', (e) => {
      listeners.forEach((cb) => cb(JSON.parse((e as MessageEvent).data)))
    })
    es.addEventListener('update', async () => {
      const data = await fetch(discovery.renders.data_json).then((r) => r.json())
      listeners.forEach((cb) => cb(data))
    })
  } catch {
    /* polling fallback */
  }

  const initial = await fetch(discovery.renders.data_json).then((r) => r.json())
  listeners.forEach((cb) => cb(initial))

  return {
    onUpdate(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    async react() {
      /* widgets have no react endpoint */
    },
    close() {
      es?.close()
      listeners.clear()
    },
  }
}
