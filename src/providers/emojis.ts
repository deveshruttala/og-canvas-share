import type { ProviderResult } from '@/providers/types'
import { ICON_STICKER_SET, searchEmojiLibrary } from '@/lib/emoji-library'

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

export async function searchIcons(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  if (!q && !browse) return null
  if (!browse && q.length < 2 && !/\bicon\b/.test(q)) return null

  const topic = q.replace(/\bicons?\b/g, '').trim()
  const icons = [...ICON_STICKER_SET]
  const filtered = topic
    ? icons
    : icons

  return {
    section: {
      id: 'icons',
      title: 'Icon stickers',
      source: topic ? `Icons · ${topic || 'all'}` : 'Icon library',
      items: filtered.slice(0, 32).map((icon, i) => ({
        id: `icon-${i}-${icon}`,
        kind: 'icon' as const,
        title: `Icon ${icon}`,
        icon,
        source: 'Stickers',
      })),
    },
  }
}
