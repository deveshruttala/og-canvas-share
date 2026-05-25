import type { Editor } from '@tldraw/editor'
import type { TLGeoShape } from '@tldraw/tlschema'
import { createShapeId, toRichText } from 'tldraw'
import { fetchLinkMeta } from '@/lib/extract-link-meta'
import { toJsonMeta } from '@/lib/json-meta'
import { isAllowedEmbedIframeHost, normalizeWallUrl } from '@/lib/normalize-wall-url'
import { getEmbedUrl, detectLinkPlatform, isEmbeddableUrl } from '@/lib/link-resolver'
import {
  getSoundPadSize,
  legacySoundPadSampleId,
  type SoundPadData,
} from '@/lib/sound-pad-samples'

export type WallHostMeta = {
  wallType:
    | 'audio'
    | 'qr'
    | 'widget'
    | 'progress'
    | 'soundpad'
    | 'polaroid'
    | 'link'
    | 'video'
    | 'code'
    | 'calendar'
    | 'embed'
    | 'poll'
    | 'map'
  wallData: Record<string, unknown>
  wallStyle?: { gradient?: string; gradientId?: string; playerThemeId?: string }
}

/** Invisible geo rectangle — HTML overlay in WallCustomOverlay provides the visuals. */
export function wallHostGeoProps(w: number, h: number) {
  return {
    geo: 'rectangle' as const,
    w,
    h,
    dash: 'draw' as const,
    color: 'black' as const,
    fill: 'none' as const,
    size: 's' as const,
    font: 'sans' as const,
    align: 'middle' as const,
    verticalAlign: 'middle' as const,
    growY: 0,
    url: '',
    scale: 1,
    labelColor: 'black' as const,
    richText: toRichText(''),
  }
}

export const WALL_LINK_W = 320
export const WALL_LINK_H = 148

function fallbackLinkTitle(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '').split('/').pop()
    return path ? decodeURIComponent(path.replace(/-/g, ' ')) : u.hostname.replace(/^www\./, '')
  } catch {
    return 'Link'
  }
}

export function buildWallLinkMeta(
  url: string,
  data: { title?: string; description?: string; image?: string },
) {
  return toJsonMeta({
    wallType: 'link',
    wallData: {
      url,
      title: data.title && data.title !== url ? data.title : fallbackLinkTitle(url),
      description: data.description,
      image: data.image,
    },
    wallStyle: { gradient: 'linear-gradient(145deg, #242836 0%, #12141a 100%)' },
    linkTo: { url, openInNewTab: true },
  })
}

export async function createWallLinkShape(
  editor: Editor,
  url: string,
  center: { x: number; y: number },
  hints?: { title?: string; description?: string; image?: string },
) {
  const normalized = normalizeWallUrl(url)
  const meta = hints?.title
    ? { title: hints.title, description: hints.description, image: hints.image }
    : await fetchLinkMeta(normalized)
  const h = meta.image ? WALL_LINK_H : 120
  editor.createShape({
    id: createShapeId(),
    type: 'geo',
    x: center.x - WALL_LINK_W / 2,
    y: center.y - h / 2,
    opacity: 0.001,
    props: wallHostGeoProps(WALL_LINK_W, h),
    meta: buildWallLinkMeta(normalized, meta),
  })
}

/** Replace tldraw bookmark placeholders with rich link overlays. */
export async function upgradeLegacyBookmarks(editor: Editor) {
  const bookmarks = editor.getCurrentPageShapes().filter((s) => s.type === 'bookmark')
  if (bookmarks.length === 0) return

  for (const shape of bookmarks) {
    const props = shape.props as { url?: string; w?: number; h?: number }
    const url = props.url
    if (!url) {
      editor.deleteShapes([shape.id])
      continue
    }
    const cx = shape.x + (props.w ?? 160) / 2
    const cy = shape.y + (props.h ?? 120) / 2
    editor.run(() => {
      editor.deleteShapes([shape.id])
    })
    await createWallLinkShape(editor, url, { x: cx, y: cy })
  }
}

/**
 * Map a wall host shape to CSS pixels inside InFrontOfTheCanvas.
 * Must use pageToViewport (not pageToScreen) — the overlay layer shares the
 * tldraw viewport origin; pageToScreen includes screenBounds and misaligns widgets.
 */
export function getWallOverlayLayout(
  editor: Editor,
  shape: { id: TLGeoShape['id']; x: number; y: number; rotation: number; props: { w: number; h: number } },
) {
  const bounds = editor.getShapePageBounds(shape.id)
  const zoom = editor.getZoomLevel()

  if (bounds) {
    const nw = editor.pageToViewport({ x: bounds.x, y: bounds.y })
    const se = editor.pageToViewport({ x: bounds.x + bounds.w, y: bounds.y + bounds.h })
    return {
      left: nw.x,
      top: nw.y,
      width: Math.max(1, se.x - nw.x),
      height: Math.max(1, se.y - nw.y),
      rotationDeg: (shape.rotation * 180) / Math.PI,
    }
  }

  const topLeft = editor.pageToViewport({ x: shape.x, y: shape.y })
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: shape.props.w * zoom,
    height: shape.props.h * zoom,
    rotationDeg: (shape.rotation * 180) / Math.PI,
  }
}

/** Replace tldraw embed shapes that cannot load in an iframe with rich link cards. */
export async function upgradeBrokenEmbeds(editor: Editor) {
  const embeds = editor.getCurrentPageShapes().filter((s) => s.type === 'embed')
  for (const shape of embeds) {
    const url = (shape.props as { url?: string }).url
    if (!url) {
      editor.deleteShapes([shape.id])
      continue
    }
    const normalized = normalizeWallUrl(url)
    if (isAllowedEmbedIframeHost(normalized)) continue

    const bounds = editor.getShapePageBounds(shape.id)
    const cx = bounds ? bounds.x + bounds.w / 2 : shape.x
    const cy = bounds ? bounds.y + bounds.h / 2 : shape.y
    editor.run(() => editor.deleteShapes([shape.id]))
    await createWallLinkShape(editor, normalized, { x: cx, y: cy })
  }
}

/** Replace tldraw embeds that point at homepages or other non-player URLs with link cards. */
export async function upgradeInvalidEmbeds(editor: Editor) {
  const embeds = editor.getCurrentPageShapes().filter((s) => s.type === 'embed')
  for (const shape of embeds) {
    const props = shape.props as { url?: string; w?: number; h?: number }
    const rawUrl = props.url?.trim() ?? ''
    if (!rawUrl) {
      editor.deleteShapes([shape.id])
      continue
    }
    const normalized = normalizeWallUrl(rawUrl)
    const platform = detectLinkPlatform(normalized)
    const embedUrl = getEmbedUrl(normalized, platform) ?? rawUrl
    if (isEmbeddableUrl(embedUrl) && isAllowedEmbedIframeHost(embedUrl)) {
      if (embedUrl !== rawUrl) {
        editor.updateShape({
          id: shape.id,
          type: 'embed',
          props: { ...props, url: embedUrl },
        })
      }
      continue
    }
    const bounds = editor.getShapePageBounds(shape.id)
    const cx = bounds ? bounds.x + bounds.w / 2 : shape.x
    const cy = bounds ? bounds.y + bounds.h / 2 : shape.y
    editor.run(() => editor.deleteShapes([shape.id]))
    await createWallLinkShape(editor, normalized, { x: cx, y: cy })
  }
}

/** Fix persisted meta with undefined nested fields (breaks tldraw JSON validation). */
export function sanitizeWallShapeMetas(editor: Editor) {
  const shapes = editor.getCurrentPageShapes().filter((s) => s.meta && Object.keys(s.meta).length > 0)
  if (shapes.length === 0) return

  editor.run(() => {
    for (const shape of shapes) {
      const raw = shape.meta as Record<string, unknown>
      const clean = toJsonMeta(raw)
      if (JSON.stringify(clean) !== JSON.stringify(raw)) {
        editor.updateShape({ id: shape.id, type: shape.type, meta: clean })
      }
    }
  })
}

/** Upgrade legacy widget hosts that used solid fills (visible grey boxes). */
export function fixInvisibleWallHosts(editor: Editor) {
  const shapes = editor.getCurrentPageShapes().filter(
    (s) => s.type === 'geo' && (s.meta as WallHostMeta | undefined)?.wallType,
  )
  if (shapes.length === 0) return

  editor.run(() => {
    for (const shape of shapes) {
      if (shape.type !== 'geo') continue
      const meta = shape.meta as WallHostMeta | undefined
      const bounds = editor.getShapePageBounds(shape.id)
      let w = bounds?.w ?? (shape.props as { w: number }).w
      let h = bounds?.h ?? (shape.props as { h: number }).h
      if (meta?.wallType === 'soundpad') {
        const raw = { ...(meta.wallData ?? {}) } as SoundPadData
        const legacySound = legacySoundPadSampleId(raw)
        const wallData: SoundPadData = legacySound ? { ...raw, sound: legacySound } : raw
        const size = getSoundPadSize(wallData)
        w = size.w
        h = size.h
        editor.updateShape({
          id: shape.id,
          type: 'geo',
          x: bounds?.x ?? shape.x,
          y: bounds?.y ?? shape.y,
          rotation: 0,
          opacity: 0.001,
          props: wallHostGeoProps(w, h),
          meta: toJsonMeta({ ...meta, wallData }),
        })
        continue
      }
      editor.updateShape({
        id: shape.id,
        type: 'geo',
        x: bounds?.x ?? shape.x,
        y: bounds?.y ?? shape.y,
        rotation: 0,
        opacity: 0.001,
        props: wallHostGeoProps(w, h),
      })
    }
  })
}
