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

type IaVideoDoc = { identifier: string; title: string }

const IA_VIDEO_TIMEOUT_MS = 2500
const IA_VIDEO_MAX_BYTES = 600_000_000

async function fetchIaMp4(identifier: string): Promise<{ name: string; size: number } | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), IA_VIDEO_TIMEOUT_MS)
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`, { signal: ctrl.signal })
    if (!res.ok) return null
    const data = (await res.json()) as { files?: { name?: string; format?: string; size?: string }[] }
    const files = data.files ?? []
    // Prefer the smallest mp4 (avoid 1GB blockbusters)
    const mp4 = files
      .filter((f) => {
        const name = (f.name ?? '').toLowerCase()
        const size = Number(f.size ?? 0)
        return name.endsWith('.mp4') && size > 0 && size < IA_VIDEO_MAX_BYTES
      })
      .sort((a, b) => Number(a.size ?? 0) - Number(b.size ?? 0))[0]
    if (!mp4?.name) return null
    return { name: mp4.name, size: Number(mp4.size ?? 0) }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Internet Archive videos — free, no key. Resolves the smallest mp4 per item. */
async function searchInternetArchiveVideos(query: string, limit = 4): Promise<OmniItem[]> {
  const q = query.trim()
  if (q.length < 2) return []
  try {
    const params = new URLSearchParams({
      q: `${q} AND mediatype:movies`,
      'fl[]': 'identifier,title',
      rows: String(Math.min(limit, 6)),
      output: 'json',
    })
    const res = await fetch(`https://archive.org/advancedsearch.php?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as { response?: { docs?: IaVideoDoc[] } }
    const docs = data.response?.docs ?? []
    if (!docs.length) return []

    // Only fetch metadata for what we'll show — each call can take ~1s.
    const settled = await Promise.all(
      docs.slice(0, limit).map(async (doc) => {
        const file = await fetchIaMp4(doc.identifier)
        if (!file) return null
        const src = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(file.name)}`
        const poster = `https://archive.org/services/img/${doc.identifier}`
        return {
          id: `ia-video-${doc.identifier}`,
          kind: 'video' as const,
          title: doc.title?.slice(0, 80) ?? 'Archive clip',
          subtitle: 'Internet Archive · CC',
          thumb: poster,
          previewUrl: src,
          source: 'Archive',
          payload: { src, poster, title: doc.title },
        } satisfies OmniItem
      }),
    )
    return settled.filter((x) => x != null)
  } catch {
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

  const [coverr, pexels, archive] = await Promise.all([
    searchCoverrVideos(q, 12),
    searchPexelsVideos(q, 10),
    searchInternetArchiveVideos(q, 4),
  ])

  const items = [...pexels, ...coverr, ...archive]

  const sources: string[] = []
  if (pexels.length) sources.push('Pexels')
  if (coverr.length) sources.push('Coverr (no key)')
  if (archive.length) sources.push('Internet Archive (no key)')

  // Always return a section so the user sees status, not an empty panel.
  if (items.length === 0) {
    return {
      section: {
        id: 'videos',
        title: 'Video clips',
        source: 'No matches',
        items: [],
        error: !hasKey('pexels')
          ? `No videos for "${q}" from free sources (Coverr/Internet Archive). Add a Pexels key in Connections for HD stock clips.`
          : `No videos found for "${q}".`,
        needsKey: !hasKey('pexels') ? 'pexels' : undefined,
      },
    }
  }

  return {
    section: {
      id: 'videos',
      title: 'Video clips',
      source: sources.join(' · ') || 'Search',
      needsKey: !hasKey('pexels') && !coverr.length && !archive.length ? 'pexels' : undefined,
      items: items.slice(0, 24),
      more: items.length > 24,
      error: !hasKey('pexels') && items.length < 6
        ? 'Free sources only — add Pexels for more HD stock video.'
        : undefined,
    },
  }
}
