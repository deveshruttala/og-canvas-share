import type { DenoKv } from './types.ts'
import type { WidgetInstanceRecord } from './types.ts'

const SLUG_RE = /^[a-z0-9-]{3,48}$/

export function validWidgetSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

export async function createWidget(
  kv: DenoKv,
  owner: { id: string; username: string },
  body: Partial<WidgetInstanceRecord> & { id?: string; widgetId: string },
): Promise<{ widget?: WidgetInstanceRecord; error?: string; status?: number }> {
  const id = (body.id ?? `${owner.username}-${body.widgetId}`).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 48)
  if (!validWidgetSlug(id)) return { error: 'Invalid widget id', status: 400 }

  const existing = await kv.get(['widgets', id])
  if (existing.value) return { error: 'Widget id taken', status: 409 }

  const now = new Date().toISOString()
  const widget: WidgetInstanceRecord = {
    id,
    ownerId: owner.id,
    ownerUsername: owner.username,
    widgetId: body.widgetId,
    name: body.name ?? body.widgetId,
    config: body.config ?? {},
    size: body.size ?? { w: 320, h: 240 },
    theme: body.theme ?? {
      background: '#0a0a0f',
      surface: '#0d0e12',
      text: '#fafafa',
      accent: '#beee1d',
      radius: 'lg',
      shadow: 'lifted',
      font: 'mono',
    },
    visibility: body.visibility ?? 'public',
    wallElementId: body.wallElementId,
    wallUsername: body.wallUsername,
    createdAt: now,
    updatedAt: now,
    views: 0,
    shareVersion: 1,
  }

  await kv.atomic()
    .set(['widgets', id], widget)
    .set(['widgets-by-owner', owner.username, id], true)
    .commit()

  return { widget }
}

export async function getWidget(kv: DenoKv, id: string): Promise<WidgetInstanceRecord | null> {
  const entry = await kv.get<WidgetInstanceRecord>(['widgets', id])
  return entry.value ?? null
}

export async function listOwnerWidgets(kv: DenoKv, username: string): Promise<WidgetInstanceRecord[]> {
  const widgets: WidgetInstanceRecord[] = []
  const iter = kv.list({ prefix: ['widgets-by-owner', username] })
  for await (const entry of iter) {
    const id = entry.key[2] as string
    const w = await getWidget(kv, id)
    if (w) widgets.push(w)
  }
  return widgets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function updateWidget(
  kv: DenoKv,
  owner: { id: string; username: string },
  id: string,
  patch: Partial<WidgetInstanceRecord>,
): Promise<{ widget?: WidgetInstanceRecord; error?: string; status?: number }> {
  const current = await getWidget(kv, id)
  if (!current) return { error: 'Not found', status: 404 }
  if (current.ownerId !== owner.id) return { error: 'Forbidden', status: 403 }

  const widget: WidgetInstanceRecord = {
    ...current,
    ...patch,
    id: current.id,
    ownerId: current.ownerId,
    ownerUsername: current.ownerUsername,
    updatedAt: new Date().toISOString(),
  }
  await kv.set(['widgets', id], widget)
  return { widget }
}

export async function deleteWidget(
  kv: DenoKv,
  owner: { id: string; username: string },
  id: string,
): Promise<{ ok?: boolean; error?: string; status?: number }> {
  const current = await getWidget(kv, id)
  if (!current) return { error: 'Not found', status: 404 }
  if (current.ownerId !== owner.id) return { error: 'Forbidden', status: 403 }

  await kv.atomic()
    .delete(['widgets', id])
    .delete(['widgets-by-owner', owner.username, id])
    .commit()
  return { ok: true }
}
