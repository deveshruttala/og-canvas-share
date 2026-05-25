import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type MetObject = {
  objectID: number
  title?: string
  primaryImageSmall?: string
  primaryImage?: string
  artistDisplayName?: string
  objectURL?: string
}

async function fetchMetObject(id: number): Promise<OmniItem | null> {
  try {
    const res = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
    )
    if (!res.ok) return null
    const o = (await res.json()) as MetObject
    const url = o.primaryImageSmall ?? o.primaryImage
    if (!url) return null
    return {
      id: `met-${o.objectID}`,
      kind: 'image',
      title: o.title ?? 'Artwork',
      subtitle: o.artistDisplayName ?? 'Met Museum',
      thumb: url,
      previewUrl: o.primaryImage ?? url,
      source: 'Met Museum',
      attribution: 'The Metropolitan Museum of Art',
      payload: {
        url: o.primaryImage ?? url,
        attribution: 'The Metropolitan Museum of Art',
        creatorUrl: o.objectURL,
      },
    }
  } catch {
    return null
  }
}

/** Met Museum Open Access — no key. */
export async function searchMetMuseumImages(q: string, limit = 8): Promise<ImageSourceResult> {
  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`,
    )
    if (!searchRes.ok) {
      return { items: [], source: 'Met Museum', error: `Met search failed (${searchRes.status})` }
    }
    const data = (await searchRes.json()) as { objectIDs?: number[] }
    const ids = (data.objectIDs ?? []).slice(0, limit)
    if (!ids.length) {
      return { items: [], source: 'Met Museum', error: 'No Met Museum matches' }
    }

    const settled = await Promise.all(ids.map((id) => fetchMetObject(id)))
    const items = settled.filter((x): x is OmniItem => Boolean(x))
    return { items, source: 'Met Museum' }
  } catch (err) {
    console.warn('[images] Met Museum error', err)
    return { items: [], source: 'Met Museum', error: 'Met Museum unavailable' }
  }
}
