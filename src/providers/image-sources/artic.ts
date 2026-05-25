import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type ArticHit = {
  id: number
  title?: string
  image_id?: string
  artist_title?: string
}

/** Art Institute of Chicago — no key, IIIF thumbnails. */
export async function searchArticImages(q: string, limit = 10): Promise<ImageSourceResult> {
  try {
    const params = new URLSearchParams({
      q,
      limit: String(Math.min(limit, 20)),
      fields: 'id,title,image_id,artist_title',
    })
    const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?${params}`)
    if (!res.ok) {
      return { items: [], source: 'Art Institute', error: `Art Institute error (${res.status})` }
    }
    const data = (await res.json()) as { data?: ArticHit[] }
    const items: OmniItem[] = (data.data ?? [])
      .filter((h) => h.image_id)
      .map((h) => {
        const url = `https://www.artic.edu/iiif/2/${h.image_id}/full/843,/0/default.jpg`
        const thumb = `https://www.artic.edu/iiif/2/${h.image_id}/full/400,/0/default.jpg`
        return {
          id: `artic-${h.id}`,
          kind: 'image' as const,
          title: h.title ?? 'Artwork',
          subtitle: h.artist_title ?? 'Art Institute of Chicago',
          thumb,
          previewUrl: url,
          source: 'Art Institute',
          attribution: 'Art Institute of Chicago',
          payload: {
            url,
            attribution: 'Art Institute of Chicago',
            creatorUrl: `https://www.artic.edu/artworks/${h.id}`,
          },
        }
      })

    return {
      items,
      source: 'Art Institute of Chicago',
      error: items.length ? undefined : 'No Art Institute matches',
    }
  } catch (err) {
    console.warn('[images] Art Institute error', err)
    return { items: [], source: 'Art Institute', error: 'Art Institute unavailable' }
  }
}
