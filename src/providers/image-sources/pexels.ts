import { getProviderKey } from '@/lib/provider-config'
import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type PexelsPhoto = {
  id: number
  alt?: string
  photographer: string
  src: { medium: string; large: string; original?: string }
}

export async function searchPexelsImages(q: string, limit = 24): Promise<ImageSourceResult> {
  const key = getProviderKey('pexels')
  if (!key) return { items: [], source: 'Pexels' }

  try {
    const params = new URLSearchParams({ q, per_page: String(Math.min(limit, 40)) })
    const res = await fetch(`/wall-img-api/pexels?${params.toString()}`, {
      headers: { Authorization: key },
    })
    if (!res.ok) {
      return { items: [], source: 'Pexels', error: `Pexels error (${res.status})` }
    }
    const data = (await res.json()) as { photos?: PexelsPhoto[] }
    const items: OmniItem[] = (data.photos ?? []).map((p) => ({
      id: `pexels-${p.id}`,
      kind: 'image' as const,
      title: p.alt ?? 'Photo',
      subtitle: p.photographer,
      thumb: p.src.medium,
      previewUrl: p.src.large,
      source: 'Pexels',
      attribution: p.photographer,
      payload: { url: p.src.original ?? p.src.large, attribution: p.photographer },
    }))
    return { items, source: 'Pexels' }
  } catch (err) {
    console.warn('[images] Pexels error', err)
    return { items: [], source: 'Pexels', error: 'Pexels request failed' }
  }
}
