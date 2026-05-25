import type { OmniItem } from '@/providers/types'

type iTunesTrack = {
  trackId: number
  trackName: string
  artistName: string
  collectionName?: string
  previewUrl?: string
  artworkUrl100?: string
  trackTimeMillis?: number
}

/** Apple iTunes Search — 30s previews, no API key (best music search fallback). */
export async function searchItunesMusic(query: string, limit = 12): Promise<OmniItem[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const params = new URLSearchParams({
      term: q,
      media: 'music',
      entity: 'song',
      limit: String(Math.min(limit, 25)),
    })
    const res = await fetch(`https://itunes.apple.com/search?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as { results?: iTunesTrack[] }

    return (data.results ?? [])
      .filter((t) => t.previewUrl)
      .map((t) => ({
        id: `itunes-${t.trackId}`,
        kind: 'audio' as const,
        title: t.trackName,
        subtitle: t.artistName,
        thumb: t.artworkUrl100?.replace('100x100', '200x200'),
        previewUrl: t.previewUrl,
        duration: t.trackTimeMillis ? Math.round(t.trackTimeMillis / 1000) : undefined,
        source: 'iTunes',
        attribution: 'Apple iTunes Preview',
        payload: {
          src: t.previewUrl,
          title: t.trackName,
          artist: t.artistName,
          cover: t.artworkUrl100,
          badge: 'iTunes · 30s preview',
        },
      }))
  } catch (err) {
    console.warn('[audio] iTunes error', err)
    return []
  }
}
