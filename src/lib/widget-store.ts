import { nanoid } from 'nanoid'
import {
  deleteWidgetInstance,
  listLocalWidgets,
  loadWidgetInstance,
  saveWidgetInstance,
} from '@/persist/db'
import { api, isApiConfigured } from '@/lib/api'
import { WIDGET_CATALOG } from '@/widgets/catalog'
import {
  DEFAULT_WIDGET_THEME,
  type WidgetInstance,
  type WidgetTheme,
} from '@/types/widget-instance'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

export function catalogWidgetName(widgetId: string): string {
  return WIDGET_CATALOG.find((w) => w.id === widgetId)?.name ?? widgetId
}

export async function createStandaloneWidget(input: {
  ownerId: string
  ownerUsername?: string
  widgetId: string
  config?: Record<string, unknown>
  name?: string
  size?: { w: number; h: number }
  theme?: WidgetTheme
  wallElementId?: string
  wallUsername?: string
  id?: string
}): Promise<WidgetInstance> {
  const catalog = WIDGET_CATALOG.find((w) => w.id === input.widgetId)
  const id = slugify(input.id ?? `${input.ownerUsername ?? 'local'}-${input.widgetId}-${nanoid(6)}`)
  const now = new Date().toISOString()

  const widget: WidgetInstance = {
    id,
    ownerId: input.ownerId,
    ownerUsername: input.ownerUsername,
    widgetId: input.widgetId,
    name: input.name ?? catalog?.name ?? input.widgetId,
    config: { ...catalog?.config, ...input.config },
    size: input.size ?? { w: 320, h: 240 },
    theme: input.theme ?? DEFAULT_WIDGET_THEME,
    visibility: 'public',
    wallElementId: input.wallElementId,
    wallUsername: input.wallUsername,
    createdAt: now,
    updatedAt: now,
    views: 0,
    shareVersion: 1,
  }

  if (isApiConfigured() && input.ownerUsername) {
    const remote = await api.createWidget({
      id,
      widgetId: input.widgetId,
      name: widget.name,
      config: widget.config,
      size: widget.size,
      theme: widget.theme,
      visibility: widget.visibility,
      wallElementId: input.wallElementId,
      wallUsername: input.wallUsername,
    })
    await saveWidgetInstance(remote)
    return remote
  }

  await saveWidgetInstance(widget)
  return widget
}

export async function fetchWidget(id: string): Promise<WidgetInstance | null> {
  if (isApiConfigured()) {
    try {
      const remote = await api.getWidget(id)
      if (remote) {
        await saveWidgetInstance(remote)
        return remote
      }
    } catch {
      /* fallback local */
    }
  }
  return (await loadWidgetInstance(id)) ?? null
}

export async function updateStandaloneWidget(
  widget: WidgetInstance,
  patch: Partial<WidgetInstance>,
): Promise<WidgetInstance> {
  const updated = { ...widget, ...patch, updatedAt: new Date().toISOString() }
  if (isApiConfigured()) {
    const remote = await api.updateWidget(widget.id, patch)
    await saveWidgetInstance(remote)
    return remote
  }
  await saveWidgetInstance(updated)
  return updated
}

export async function getOwnerWidgets(ownerId: string, ownerUsername?: string): Promise<WidgetInstance[]> {
  if (isApiConfigured() && ownerUsername) {
    try {
      const remote = await api.listMyWidgets()
      for (const w of remote) await saveWidgetInstance(w)
      return remote
    } catch {
      /* local fallback */
    }
  }
  return listLocalWidgets(ownerId)
}

export async function removeStandaloneWidget(widget: WidgetInstance): Promise<void> {
  if (isApiConfigured()) {
    try {
      await api.deleteWidget(widget.id)
    } catch {
      /* continue local delete */
    }
  }
  await deleteWidgetInstance(widget.id)
}

export function bumpWidgetShareVersion(widget: WidgetInstance): WidgetInstance {
  return { ...widget, shareVersion: (widget.shareVersion ?? 1) + 1 }
}
