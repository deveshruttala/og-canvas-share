import { getProviderKey } from '@/lib/provider-config'
import type { OmniItem } from '@/providers/types'

export async function searchPixabayAudio(query: string, limit = 8): Promise<OmniItem[]> {
  const key = getProviderKey('pixabay')
  if (!key) return []

  const q = query.trim()
  if (q.length < 2) return []

  try {
    const params = new URLSearchParams({ q, per_page: String(limit) })
    const res = await fetch(`/wall-audio-api/pixabay?${params}`, {
      headers: { 'X-Pixabay-Key': key },
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      hits?: {
        id: number
        title?: string
        tags?: string
        duration?: number
        previewURL?: string
        audio?: string
        user?: string
      }[]
    }

    return (data.hits ?? [])
      .filter((h) => h.audio || h.previewURL)
      .map((h) => {
        const src = h.audio ?? h.previewURL!
        return {
          id: `pixabay-audio-${h.id}`,
          kind: 'audio' as const,
          title: h.title ?? 'Pixabay audio',
          subtitle: h.user ?? 'Pixabay',
          previewUrl: src,
          duration: h.duration,
          source: 'Pixabay',
          payload: {
            src,
            title: h.title,
            artist: h.user,
            badge: 'Pixabay',
          },
        } satisfies OmniItem
      })
  } catch {
    return []
  }
}
