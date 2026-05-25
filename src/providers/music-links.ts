import type { OmniItem } from '@/providers/types'
import { resolveWallUrl } from '@/lib/resolve-wall-url'

type YoutubeHit = {
  videoId: string
  title: string
  author: string
  lengthSeconds?: number
  thumbnail?: string
}

type SpotifyHit = {
  id: string
  title: string
  artist: string
  url: string
  cover?: string
}

function formatDuration(sec?: number): string {
  if (!sec || sec < 1) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

async function searchYouTubeTracks(query: string): Promise<OmniItem[]> {
  try {
    const res = await fetch(`/wall-music-api/youtube?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = (await res.json()) as { items?: YoutubeHit[] }
    return (data.items ?? []).map((v, i) => {
      const url = youtubeWatchUrl(v.videoId)
      const dur = formatDuration(v.lengthSeconds)
      return {
        id: `yt-${v.videoId}-${i}`,
        kind: 'action' as const,
        title: v.title,
        subtitle: dur ? `${v.author} · ${dur}` : v.author,
        url,
        thumb: v.thumbnail,
        icon: '▶️',
        source: 'YouTube',
        payload: {
          url,
          title: v.title,
          description: v.author,
          image: v.thumbnail,
          run: async () => {
            const { wallActions } = await import('@/editor/wall-actions')
            const resolved = await resolveWallUrl(url)
            if (resolved.action === 'embed' && resolved.embedUrl) {
              wallActions.addEmbed(url, resolved.embedUrl)
            } else {
              await wallActions.addLink(url, undefined, undefined, {
                title: v.title,
                description: v.author,
                image: v.thumbnail,
              })
            }
          },
        },
      }
    })
  } catch {
    return []
  }
}

async function searchSpotifyTracks(query: string): Promise<OmniItem[]> {
  try {
    const res = await fetch(`/wall-music-api/spotify?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = (await res.json()) as { items?: SpotifyHit[]; configured?: boolean }
    if (!data.configured) {
      return [
        {
          id: 'spotify-search-fallback',
          kind: 'link',
          title: `Search “${query}” on Spotify`,
          subtitle: 'Opens Spotify search (add SPOTIFY_CLIENT_SECRET in .env for inline results)',
          url: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
          icon: '🎵',
          source: 'Spotify',
          payload: {
            url: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            title: `Spotify: ${query}`,
          },
        },
      ]
    }
    return (data.items ?? []).map((t, i) => ({
      id: `sp-${t.id}-${i}`,
      kind: 'action' as const,
      title: t.title,
      subtitle: t.artist,
      url: t.url,
      thumb: t.cover,
      icon: '🎵',
      source: 'Spotify',
      payload: {
        url: t.url,
        title: t.title,
        description: t.artist,
        image: t.cover,
        run: async () => {
          const { wallActions } = await import('@/editor/wall-actions')
          const resolved = await resolveWallUrl(t.url)
          if (resolved.action === 'embed' && resolved.embedUrl) {
            wallActions.addEmbed(t.url, resolved.embedUrl)
          } else {
            await wallActions.addLink(t.url, undefined, undefined, {
              title: t.title,
              description: t.artist,
              image: t.cover,
            })
          }
        },
      },
    }))
  } catch {
    return []
  }
}

/** Song / artist search for YouTube embeds and Spotify players. */
export async function searchMusicLinks(query: string): Promise<OmniItem[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const [youtube, spotify] = await Promise.all([searchYouTubeTracks(q), searchSpotifyTracks(q)])
  return [...youtube, ...spotify]
}
