import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'
import { displayThumbUrl } from '@/lib/asset-proxy'

const OPENVERSE_BASE = '/openverse-api/v1/images/'

type OpenverseHit = {
  id: string
  title?: string
  url?: string
  thumbnail?: string
  filetype?: string
  width?: number
  height?: number
}

function isStaticPhoto(hit: OpenverseHit): boolean {
  const url = (hit.url ?? '').toLowerCase()
  const ft = (hit.filetype ?? '').toLowerCase()
  if (ft === 'gif' || ft === 'svg') return false
  if (url.endsWith('.gif') || url.endsWith('.svg')) return false
  return Boolean(hit.url && (hit.thumbnail || hit.url))
}

/** Openverse — CC stock photos, no API key (proxied). */
export async function searchOpenverseImages(
  q: string,
  limit = 28,
  page = 1,
): Promise<ImageSourceResult> {
  try {
    const params = new URLSearchParams({
      q,
      page_size: String(Math.min(limit, 50)),
      page: String(Math.max(1, page)),
      license: 'cc0,pdm',
    })
    const res = await fetch(`${OPENVERSE_BASE}?${params}`)
    if (!res.ok) {
      return {
        items: [],
        source: 'Openverse',
        error: res.status === 403 ? 'Openverse rate limited — retry shortly' : `Openverse error (${res.status})`,
      }
    }
    const data = (await res.json()) as { results?: OpenverseHit[] }
    const items: OmniItem[] = (data.results ?? [])
      .filter(isStaticPhoto)
      .slice(0, limit)
      .map((r) => {
        const full = r.url!
        const thumb = displayThumbUrl(r.thumbnail ?? full)
        return {
          id: `openverse-${r.id}`,
          kind: 'image' as const,
          title: r.title?.trim() || q,
          thumb,
          previewUrl: full,
          source: 'Openverse',
          attribution: 'Openverse',
          payload: { url: full, attribution: 'Openverse' },
        }
      })

    return {
      items,
      source: 'Openverse',
      error: items.length ? undefined : 'No Openverse matches',
    }
  } catch (err) {
    console.warn('[images] Openverse error', err)
    return { items: [], source: 'Openverse', error: 'Openverse unavailable' }
  }
}
