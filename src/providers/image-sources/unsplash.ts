import { getProviderKey } from '@/lib/provider-config'
import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type UnsplashPhoto = {
  id: string
  alt_description?: string
  description?: string
  urls: { small: string; regular: string; full?: string }
  user: { name: string }
}

export async function searchUnsplashImages(q: string, limit = 24): Promise<ImageSourceResult> {
  const key = getProviderKey('unsplash')
  if (!key) return { items: [], source: 'Unsplash' }

  try {
    const params = new URLSearchParams({
      query: q,
      per_page: String(Math.min(limit, 30)),
      content_filter: 'high',
    })
    const res = await fetch(`/wall-img-api/unsplash?${params.toString()}`, {
      headers: { Authorization: `Client-ID ${key}` },
    })
    if (!res.ok) {
      return { items: [], source: 'Unsplash', error: `Unsplash error (${res.status})` }
    }
    const data = (await res.json()) as { results?: UnsplashPhoto[] }
    const items: OmniItem[] = (data.results ?? []).map((p) => ({
      id: `unsplash-${p.id}`,
      kind: 'image' as const,
      title: p.alt_description ?? p.description ?? 'Photo',
      subtitle: p.user.name,
      thumb: p.urls.small,
      previewUrl: p.urls.regular,
      source: 'Unsplash',
      attribution: p.user.name,
      payload: { url: p.urls.full ?? p.urls.regular, attribution: p.user.name },
    }))
    return { items, source: 'Unsplash' }
  } catch (err) {
    console.warn('[images] Unsplash error', err)
    return { items: [], source: 'Unsplash', error: 'Unsplash request failed' }
  }
}
