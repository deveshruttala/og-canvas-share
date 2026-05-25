import type { ProviderResult } from '@/providers/types'
import { searchMusicLinks } from '@/providers/music-links'
import { buildPasteUrlItem } from '@/providers/link-helpers'

function youtubeItems(query: string, browse: boolean) {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return Promise.resolve([])
  const q = raw.length < 2 ? 'music video' : raw
  return searchMusicLinks(q).then((items) => items.filter((i) => i.source === 'YouTube'))
}

/** YouTube & Spotify players — lives under Audio tab. */
export async function searchAudioStreaming(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) {
    const paste = buildPasteUrlItem(raw)
    if (!paste) return null
  }

  const q = raw.length < 2 ? 'lofi chill' : raw
  const items = []

  const paste = buildPasteUrlItem(raw)
  if (paste) items.push(paste)

  if (!browse || raw.length >= 2) {
    const music = await searchMusicLinks(q)
    items.push(...music)
  }

  if (items.length === 0) return null

  return {
    section: {
      id: 'streaming',
      title: 'YouTube & Spotify',
      source: 'Paste a track URL · or search songs',
      items: items.slice(0, 16),
      more: items.length > 16,
    },
  }
}

/** YouTube search under Video tab (embed players + stock clips). */
export async function searchYoutubeVideosSection(
  query: string,
  browse = false,
): Promise<ProviderResult | null> {
  const raw = query.trim()
  const q = raw.length < 2 ? 'music video' : raw
  const paste = buildPasteUrlItem(raw)
  const items = [...(paste ? [paste] : [])]

  if (raw.length >= 2 || browse) {
    items.push(...(await youtubeItems(q, browse)))
  }

  if (items.length === 0) return null

  return {
    section: {
      id: 'youtube',
      title: 'YouTube',
      source: 'Search videos · paste watch URL',
      items: items.slice(0, 12),
      more: items.length > 12,
    },
  }
}
