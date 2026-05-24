export type DenoKv = Awaited<ReturnType<typeof Deno.openKv>>

export type WidgetInstanceRecord = {
  id: string
  ownerId: string
  ownerUsername: string
  widgetId: string
  name?: string
  config: Record<string, unknown>
  size: { w: number; h: number }
  theme: Record<string, unknown>
  visibility: 'public' | 'unlisted' | 'private'
  wallElementId?: string
  wallUsername?: string
  createdAt: string
  updatedAt: string
  views: number
  shareVersion?: number
}
