import { compressImage, blobToDataUrl } from '@/lib/compress-image'
import type { CanvasElement } from '@/types/canvas'
import { createEmbedElement } from '@/types/canvas'
import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { fetchLinkMeta } from '@/lib/extract-link-meta'
import { readClipboardSlice, routeClipboard } from '@/paste/router'
import { executePasteRoute } from '@/paste/execute'

/** Universal paste for tldraw editor — routes through paste/router. */
export async function handleTldrawPaste(e: ClipboardEvent): Promise<boolean> {
  const slice = readClipboardSlice(e.clipboardData)
  const route = routeClipboard(slice)
  if (!route) return false
  try {
    await executePasteRoute(route)
    return true
  } catch {
    return false
  }
}

export type PasteHandlers = {
  addElement: (el: CanvasElement) => void
  addTextAt: (x: number, y: number, text?: string) => void
  addImageAt: (x: number, y: number, src: string, alt?: string) => void
  addLinkAt: (
    x: number,
    y: number,
    url: string,
    meta?: { title?: string; description?: string; image?: string },
  ) => void
}

/** Universal paste — detects content type and creates the right wall element */
export async function handleWallPaste(
  e: ClipboardEvent,
  center: { x: number; y: number },
  handlers: PasteHandlers,
): Promise<boolean> {
  const items = e.clipboardData?.items
  if (items) {
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue
        try {
          const blob = await compressImage(file)
          const src = await blobToDataUrl(blob)
          handlers.addImageAt(center.x - 140, center.y - 100, src, file.name)
          return true
        } catch {
          /* try text fallback */
        }
      }
    }
  }

  const slice = readClipboardSlice(e.clipboardData)
  const route = routeClipboard(slice)
  if (!route) return false

  if (route.kind === 'image-file') {
    try {
      const blob = await compressImage(route.file)
      const src = await blobToDataUrl(blob)
      handlers.addImageAt(center.x - 140, center.y - 100, src, route.file.name)
      return true
    } catch {
      return false
    }
  }

  if (route.kind === 'link' || route.kind === 'embed') {
    const url = route.url
    const platform = detectLinkPlatform(url)
    const embedUrl = getEmbedUrl(url, platform)
    if (route.kind === 'embed' || embedUrl) {
      const eu = embedUrl ?? url
      if (eu) {
        handlers.addElement(createEmbedElement(center.x - 200, center.y - 120, url, eu, platform))
        return true
      }
    }
    const meta = await fetchLinkMeta(url)
    handlers.addLinkAt(center.x - 150, center.y - 60, url, meta)
    return true
  }

  if (route.kind === 'sticky' || route.kind === 'html') {
    const text = route.kind === 'html' ? route.plain : route.text
    handlers.addTextAt(center.x - 110, center.y - 80, text)
    return true
  }

  return false
}
