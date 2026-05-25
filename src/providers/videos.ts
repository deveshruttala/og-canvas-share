import type { ProviderResult } from '@/providers/types'
import type { OmniItem } from '@/providers/types'
import { getProviderKey, hasKey } from '@/lib/provider-config'

type CoverrVideo = {
  id: string
  title?: string
  description?: string
  poster?: string
  urls?: { mp4?: string; mp4_preview?: string }
  tags?: { name: string }[]
}

type PexelsVideoFile = { link: string; quality?: string; width?: number }
type PexelsVideo = {
  id: number
  url: string
  image: string
  duration: number
  video_files?: PexelsVideoFile[]
  user?: { name: string }
}

async function searchCoverrVideos(q: string, limit = 10): Promise<OmniItem[]> {
  try {
    const params = new URLSearchParams({
      query: q || 'nature',
      page_size: String(limit),
      page: '0',
    })
    const res = await fetch(`/wall-media-api/coverr?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as { videos?: CoverrVideo[] }
    return (data.videos ?? [])
      .filter((v) => v.urls?.mp4 || v.urls?.mp4_preview)
      .map((v) => {
        const src = v.urls?.mp4 ?? v.urls?.mp4_preview!
        return {
          id: `coverr-${v.id}`,
          kind: 'video' as const,
          title: v.title ?? v.description ?? 'Stock clip',
          subtitle: 'Coverr · Free',
          thumb: v.poster,
          previewUrl: src,
          duration: undefined,
          source: 'Coverr',
          payload: { src, poster: v.poster, title: v.title },
        }
      })
  } catch (err) {
    console.warn('[videos] Coverr error', err)
    return []
  }
}

async function searchPexelsVideos(q: string, limit = 10): Promise<OmniItem[]> {
  const key = getProviderKey('pexels')
  if (!key) return []
  try {
    const params = new URLSearchParams({ q, per_page: String(limit) })
    const res = await fetch(`/wall-media-api/pexels-videos?${params}`, {
      headers: { Authorization: key },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { videos?: PexelsVideo[] }
    const items: OmniItem[] = []
    for (const v of data.videos ?? []) {
      const file =
        v.video_files?.find((f) => f.quality === 'hd' || f.quality === 'sd') ??
        v.video_files?.[0]
      const src = file?.link
      if (!src) continue
      items.push({
        id: `pexels-v-${v.id}`,
        kind: 'video',
        title: `Clip #${v.id}`,
        subtitle: v.user?.name ?? 'Pexels',
        thumb: v.image,
        previewUrl: src,
        duration: v.duration,
        source: 'Pexels',
        attribution: v.user?.name,
        payload: { src, poster: v.image, title: `Pexels clip ${v.id}` },
      })
    }
    return items
  } catch (err) {
    console.warn('[videos] Pexels video error', err)
    return []
  }
}

export async function searchVideos(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'cinematic nature' : raw

  const [coverr, pexels] = await Promise.all([
    searchCoverrVideos(q, 12),
    searchPexelsVideos(q, 10),
  ])

  const items = [...pexels, ...coverr]
  if (items.length === 0) return null

  const sources = ['Coverr (no key)']
  if (pexels.length) sources.push('Pexels')

  return {
    section: {
      id: 'videos',
      title: 'Video clips',
      source: sources.join(' · '),
      needsKey: !hasKey('pexels') && !coverr.length ? 'pexels' : undefined,
      items: items.slice(0, 24),
      more: items.length > 24,
      error: !hasKey('pexels')
        ? 'Coverr works without a key. Add Pexels for more HD stock video.'
        : undefined,
    },
  }
}
