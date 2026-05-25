import { getProviderKey } from '@/lib/provider-config'
import type { OmniItem } from '@/providers/types'

export async function searchFreesoundAudio(query: string, limit = 8): Promise<OmniItem[]> {
  const token = getProviderKey('freesound')
  if (!token) return []

  const q = query.trim()
  if (q.length < 2) return []

  try {
    const params = new URLSearchParams({ q, page_size: String(limit) })
    const res = await fetch(`/wall-audio-api/freesound?${params}`, {
      headers: { 'X-Freesound-Token': token },
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      results?: {
        id: number
        name: string
        duration: number
        username: string
        previews: { 'preview-hq-mp3'?: string; 'preview-lq-mp3'?: string }
      }[]
    }

    const items: OmniItem[] = []
    for (const s of data.results ?? []) {
      const src = s.previews['preview-hq-mp3'] ?? s.previews['preview-lq-mp3']
      if (!src) continue
      items.push({
        id: `freesound-${s.id}`,
        kind: 'audio',
        title: s.name,
        subtitle: s.username,
        previewUrl: src,
        duration: Math.round(s.duration),
        source: 'Freesound',
        payload: {
          src,
          title: s.name,
          artist: s.username,
          badge: 'Freesound',
        },
      })
    }
    return items
  } catch {
    return []
  }
}
