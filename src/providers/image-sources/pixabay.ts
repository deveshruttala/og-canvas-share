import { getProviderKey } from '@/lib/provider-config'
import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type PixabayHit = {
  id: number
  tags: string
  previewURL: string
  webformatURL: string
  largeImageURL?: string
  imageURL?: string
  user: string
}

/** Pixabay — 4M+ CC0 images; free API key from pixabay.com/api/docs */
export async function searchPixabayImages(q: string, limit = 24): Promise<ImageSourceResult> {
  const key = getProviderKey('pixabay')
  if (!key) return { items: [], source: 'Pixabay' }

  try {
    const params = new URLSearchParams({
      q,
      image_type: 'photo',
      per_page: String(Math.min(limit, 40)),
      safesearch: 'true',
      order: 'popular',
    })
    const res = await fetch(`/wall-img-api/pixabay?${params.toString()}`, {
      headers: { 'X-Pixabay-Key': key },
    })
    if (!res.ok) {
      return { items: [], source: 'Pixabay', error: `Pixabay error (${res.status})` }
    }
    const data = (await res.json()) as { hits?: PixabayHit[]; totalHits?: number }
    const items: OmniItem[] = (data.hits ?? []).map((h) => ({
      id: `pixabay-${h.id}`,
      kind: 'image' as const,
      title: h.tags.split(',')[0]?.trim() || 'Photo',
      subtitle: h.user,
      thumb: h.previewURL,
      previewUrl: h.largeImageURL ?? h.webformatURL,
      source: 'Pixabay',
      attribution: h.user,
      payload: {
        url: h.largeImageURL ?? h.imageURL ?? h.webformatURL,
        attribution: h.user,
      },
    }))
    return { items, source: 'Pixabay', error: items.length ? undefined : 'No Pixabay matches' }
  } catch (err) {
    console.warn('[images] Pixabay error', err)
    return { items: [], source: 'Pixabay', error: 'Pixabay request failed' }
  }
}
