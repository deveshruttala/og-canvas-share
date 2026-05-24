import type { DenoKv } from './types.ts'

export async function registerWebhook(kv: DenoKv, username: string, url: string): Promise<void> {
  await kv.set(['webhooks', username], { url, registeredAt: new Date().toISOString() })
}

export async function fireWebhook(kv: DenoKv, username: string, payload: unknown): Promise<void> {
  const entry = await kv.get<{ url: string }>(['webhooks', username])
  if (!entry.value?.url) return
  try {
    await fetch(entry.value.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Wall-Webhook/1.0' },
      body: JSON.stringify({ event: 'wall.updated', username, payload, at: new Date().toISOString() }),
    })
  } catch {
    /* best effort */
  }
}
