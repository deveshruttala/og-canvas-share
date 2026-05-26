import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type WikiPage = {
  pageid: number
  title?: string
  imageinfo?: Array<{ url?: string; thumburl?: string; descriptionurl?: string; mime?: string }>
}

const RASTER_MIME = /^image\/(jpeg|png|webp|gif)$/i

function isRasterThumb(info: { url?: string; thumburl?: string; mime?: string }): boolean {
  if (info.mime && !RASTER_MIME.test(info.mime)) return false
  const check = (info.thumburl ?? info.url ?? '').toLowerCase()
  if (!check) return false
  if (/\.(svg|tiff?|pdf|ogv|webm|ogv)(\?|$)/i.test(check)) return false
  return true
}

/** Wikimedia Commons — free, no API key, reliable search. */
export async function searchWikimediaImages(
  q: string,
  limit = 24,
  page = 1,
): Promise<ImageSourceResult> {
  try {
    const offset = Math.max(0, (page - 1) * limit)
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: `filetype:bitmap ${q}`,
      gsrnamespace: '6',
      gsrlimit: String(Math.min(limit, 32)),
      gsroffset: String(offset),
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '320',
    })
    const url = `/wall-img-api/wikimedia?${params.toString()}`
    const res = await fetch(url)
    if (!res.ok) {
      return { items: [], source: 'Wikimedia', error: `Wikimedia search failed (${res.status})` }
    }
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } }
    const pages = Object.values(data.query?.pages ?? {})
    const items: OmniItem[] = []

    for (const page of pages) {
      const info = page.imageinfo?.[0]
      if (!info || !isRasterThumb(info)) continue
      const full = info.url
      const thumb = info.thumburl ?? full
      if (!full || !thumb) continue
      const title = (page.title ?? 'Photo').replace(/^File:/, '').replace(/\.[^.]+$/, '')
      items.push({
        id: `wiki-${page.pageid}`,
        kind: 'image',
        title,
        thumb,
        previewUrl: full,
        source: 'Wikimedia',
        attribution: 'Wikimedia Commons',
        payload: {
          url: full,
          attribution: 'Wikimedia Commons',
          creatorUrl: info?.descriptionurl,
        },
      })
    }

    return { items, source: 'Wikimedia Commons' }
  } catch (err) {
    console.warn('[images] Wikimedia error', err)
    return { items: [], source: 'Wikimedia', error: 'Wikimedia Commons unavailable' }
  }
}
