/** Privacy-first analytics — hourly buckets, no IP persistence. */

type Kv = Awaited<ReturnType<typeof Deno.openKv>>

const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function hourKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCHours()).padStart(2, '0')}`
}

function rateLimit(ip: string, max = 60): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (bucket.count >= max) return false
  bucket.count++
  return true
}

function referrerHost(referrer?: string): string | null {
  if (!referrer?.trim()) return null
  try {
    return new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export type PingBody = {
  kind?: 'view' | 'embed' | 'reaction'
  referrer?: string
  emoji?: string
  via?: string
}

export async function handlePing(
  kv: Kv,
  scope: 'wall' | 'widget',
  id: string,
  body: PingBody,
  req: Request,
): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), { status: 429 })
  }

  const kind = body.kind ?? 'view'
  const hour = hourKey()
  const prefix = scope === 'wall' ? ['stats', 'wall', id] : ['stats', 'widget', id]

  const atomic = kv.atomic()
  const kindKey = [...prefix, hour, kind] as Deno.KvKey
  const current = (await kv.get<number>(kindKey)).value ?? 0
  atomic.set(kindKey, current + 1)

  if (kind === 'reaction' && body.emoji) {
    const reactKey = [...prefix, hour, 'react', body.emoji] as Deno.KvKey
    const reactCount = (await kv.get<number>(reactKey)).value ?? 0
    atomic.set(reactKey, reactCount + 1)
  }

  const ref = referrerHost(body.referrer ?? req.headers.get('Referer') ?? undefined)
  if (ref) {
    const refKey = [...prefix, hour, 'ref', ref] as Deno.KvKey
    const refCount = (await kv.get<number>(refKey)).value ?? 0
    atomic.set(refKey, refCount + 1)
  }

  if (body.via) {
    const viaKey = [...prefix, hour, 'via', body.via.slice(0, 64)] as Deno.KvKey
    const viaCount = (await kv.get<number>(viaKey)).value ?? 0
    atomic.set(viaKey, viaCount + 1)
  }

  await atomic.commit()

  if (scope === 'widget') {
    const widgetEntry = await kv.get<{ views?: number }>(['widgets', id])
    if (widgetEntry.value) {
      await kv.set(['widgets', id], { ...widgetEntry.value, views: (widgetEntry.value.views ?? 0) + 1 })
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getStatsSummary(kv: Kv, scope: 'wall' | 'widget', id: string, days = 30) {
  const prefix = scope === 'wall' ? ['stats', 'wall', id] : ['stats', 'widget', id]
  const hours: string[] = []
  const now = new Date()
  for (let i = 0; i < days * 24; i++) {
    const d = new Date(now.getTime() - i * 3600_000)
    hours.push(hourKey(d))
  }

  let views = 0
  let embeds = 0
  const reactions: Record<string, number> = {}
  const referrers: Record<string, number> = {}
  const hourly: { hour: string; views: number; embeds: number }[] = []

  for (const hour of hours) {
    const v = (await kv.get<number>([...prefix, hour, 'view'])).value ?? 0
    const e = (await kv.get<number>([...prefix, hour, 'embed'])).value ?? 0
    views += v
    embeds += e
    if (v || e) hourly.push({ hour, views: v, embeds: e })
  }

  const iter = kv.list({ prefix: [...prefix] })
  for await (const entry of iter) {
    const key = entry.key as Deno.KvKey
    if (key.length >= 5 && key[key.length - 2] === 'react') {
      const emoji = String(key[key.length - 1])
      reactions[emoji] = (reactions[emoji] ?? 0) + (entry.value as number)
    }
    if (key.length >= 5 && key[key.length - 2] === 'ref') {
      const host = String(key[key.length - 1])
      referrers[host] = (referrers[host] ?? 0) + (entry.value as number)
    }
  }

  const topReferrers = Object.entries(referrers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([host, count]) => ({ host, count }))

  return { views, embeds, reactions, hourly: hourly.reverse(), topReferrers }
}
