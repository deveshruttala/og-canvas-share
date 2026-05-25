import type { ProviderResult } from '@/providers/types'
import { getProviderKey } from '@/lib/provider-config'

const DEMO_AUDIO = [
  {
    id: 'demo-ocean',
    title: 'Ocean waves at sunset',
    subtitle: 'Demo · ambience',
    duration: 83,
    source: 'Demo',
  },
]

async function searchFreesound(q: string, token?: string): Promise<ProviderResult['section']['items']> {
  if (!token) return []
  const res = await fetch(
    `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(q)}&fields=id,name,previews,duration,username&filter=license:%22Creative+Commons+0%22&token=${token}&page_size=6`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).map(
    (s: { id: number; name: string; duration: number; username: string; previews: { 'preview-hq-mp3'?: string } }) => ({
      id: `freesound-${s.id}`,
      kind: 'audio' as const,
      title: s.name,
      subtitle: s.username,
      previewUrl: s.previews['preview-hq-mp3'],
      duration: Math.round(s.duration),
      source: 'Freesound',
      payload: {
        src: s.previews['preview-hq-mp3'],
        title: s.name,
        artist: s.username,
        badge: 'Freesound',
      },
    }),
  )
}

async function searchDeezer(q: string): Promise<ProviderResult['section']['items']> {
  try {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=6`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.data ?? [])
    .filter((t: { preview?: string }) => t.preview)
    .map(
      (t: {
        id: number
        title: string
        artist: { name: string }
        album: { cover_medium?: string }
        preview: string
        duration: number
      }) => ({
        id: `deezer-${t.id}`,
        kind: 'audio' as const,
        title: t.title,
        subtitle: t.artist.name,
        thumb: t.album.cover_medium,
        previewUrl: t.preview,
        duration: t.duration,
        source: 'Deezer',
        payload: {
          src: t.preview,
          title: t.title,
          artist: t.artist.name,
          cover: t.album.cover_medium,
          badge: 'Deezer',
        },
      }),
    )
  } catch {
    return []
  }
}

export async function searchAudio(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (q.length < 2) return null

  const freesoundToken = getProviderKey('freesound')
  const [fx, music] = await Promise.all([searchFreesound(q, freesoundToken), searchDeezer(q)])

  let items = [...fx, ...music]
  if (items.length === 0 && !freesoundToken) {
    items = DEMO_AUDIO.map((d) => ({
      id: d.id,
      kind: 'audio' as const,
      title: d.title,
      subtitle: d.subtitle,
      duration: d.duration,
      source: d.source,
      payload: { title: d.title, badge: 'Demo' },
    }))
  }

  if (items.length === 0) return null

  return {
    section: {
      id: 'audio',
      title: 'Audio',
      source: [freesoundToken && 'Freesound', 'Deezer'].filter(Boolean).join(' + ') || 'Demo',
      needsKey: !freesoundToken ? 'freesound' : undefined,
      items: items.slice(0, 8),
    },
  }
}
