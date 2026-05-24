import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { fetchLinkMeta } from '@/lib/extract-link-meta'
import { compressImage, blobToDataUrl } from '@/lib/compress-image'
import type { CanvasElement } from '@/types/canvas'
import { createEmbedElement } from '@/types/canvas'

import { wallActions } from '@/editor/wall-actions'

/** Universal paste for tldraw editor */
export async function handleTldrawPaste(e: ClipboardEvent): Promise<boolean> {
  const items = e.clipboardData?.items
  if (items) {
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue
        try {
          await wallActions.pasteImageFile(file)
          return true
        } catch {
          /* try text fallback */
        }
      }
    }
  }

  const text = e.clipboardData?.getData('text/plain')?.trim()
  if (!text) return false

  const urlMatch = text.match(/^https?:\/\/\S+/i)
  if (urlMatch) {
    await wallActions.pasteUrl(urlMatch[0])
    return true
  }

  await wallActions.pasteText(text)
  return true
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

  const text = e.clipboardData?.getData('text/plain')?.trim()
  if (!text) return false

  const urlMatch = text.match(/^https?:\/\/\S+/i)
  if (urlMatch) {
    const url = urlMatch[0]
    const platform = detectLinkPlatform(url)
    const embedUrl = getEmbedUrl(url, platform)

    if (embedUrl && ['youtube', 'spotify', 'vimeo', 'soundcloud'].includes(platform)) {
      handlers.addElement(
        createEmbedElement(center.x - 200, center.y - 120, url, embedUrl, platform),
      )
      return true
    }

    const meta = await fetchLinkMeta(url)
    handlers.addLinkAt(center.x - 150, center.y - 60, url, meta)
    return true
  }

  handlers.addTextAt(center.x - 110, center.y - 80, text)
  return true
}
