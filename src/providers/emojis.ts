import type { ProviderResult } from '@/providers/types'
import { searchEmojiLibrary } from '@/lib/emoji-library'
import { searchIconifyIcons } from '@/providers/iconify'

export async function searchEmojis(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim()
  if (!q && !browse) return null

  const entries = searchEmojiLibrary(q || 'popular', 40)
  const items = entries.map((e) => ({
    id: `emoji-${e.emoji}`,
    kind: 'emoji' as const,
    title: e.name,
    emoji: e.emoji,
    source: 'Emoji library',
  }))

  return {
    section: {
      id: 'emojis',
      title: 'Emojis',
      source: q ? `Matches for “${q}”` : 'Popular stamps',
      items,
      more: entries.length >= 40,
    },
  }
}

/** Icons: Iconify API (200k+ sets). Falls back to bundled stickers if API fails. */
export async function searchIcons(query: string, browse = false): Promise<ProviderResult | null> {
  const iconify = await searchIconifyIcons(query, browse)
  if (iconify?.section.items.length) return iconify
  return null
}
