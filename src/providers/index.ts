import type { OmniSection } from '@/providers/types'
import { inferActions } from '@/providers/actions'
import { searchImages } from '@/providers/images'
import { searchGifs } from '@/providers/gifs'
import { searchAudio } from '@/providers/audio'
import { searchEmojis, searchIcons } from '@/providers/emojis'
import { searchWidgets } from '@/providers/widgets'
import { searchLinks } from '@/providers/links'

const PROVIDERS = [
  inferActions,
  searchImages,
  searchGifs,
  searchAudio,
  searchEmojis,
  searchIcons,
  searchWidgets,
  searchLinks,
] as const

export async function runOmniSearch(query: string): Promise<OmniSection[]> {
  const q = query.trim()
  if (!q) return []

  const settled = await Promise.allSettled(PROVIDERS.map((fn) => fn(q)))
  const sections: OmniSection[] = []

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value?.section.items.length) {
      sections.push(result.value.section)
    }
  }

  const order = ['actions', 'images', 'gifs', 'audio', 'emojis', 'icons', 'widgets', 'links']
  sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))

  return sections
}

export { inferActions, searchImages, searchGifs, searchAudio, searchEmojis, searchIcons, searchWidgets, searchLinks }
