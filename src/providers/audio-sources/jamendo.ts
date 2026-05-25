import type { OmniItem } from '@/providers/types'
import { getIntegrationKey } from '@/lib/integration-keys'

type JamendoTrack = {
  id: string
  name: string
  duration: number
  artist_name: string
  album_name?: string
  image?: string
  audio?: string
  audiodownload?: string
  shareurl?: string
}

/** Full CC-licensed tracks — Jamendo devportal client_id (audio-only key). */
export async function searchJamendoTracks(q: string, limit = 10): Promise<OmniItem[]> {
  const clientId = getIntegrationKey('jamendo')
  if (!clientId) return []

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(limit),
      search: q,
      order: 'relevance',
      include: 'musicinfo',
    })
    const res = await fetch(`/wall-audio-api/jamendo?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as { results?: JamendoTrack[] }
    return (data.results ?? [])
      .filter((t) => t.audio)
      .map((t) => ({
        id: `jamendo-${t.id}`,
        kind: 'audio' as const,
        title: t.name,
        subtitle: `${t.artist_name} · Jamendo CC`,
        thumb: t.image,
        previewUrl: t.audio,
        duration: t.duration,
        source: 'Jamendo',
        attribution: `${t.artist_name} · CC via Jamendo`,
        payload: {
          src: t.audio,
          title: t.name,
          artist: t.artist_name,
          cover: t.image,
          badge: 'Jamendo · Full track',
          license: 'CC',
        },
      }))
  } catch (err) {
    console.warn('[audio] Jamendo error', err)
    return []
  }
}
