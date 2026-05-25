import type { OmniSection } from '@/providers/types'
import type { OmniSearchFilter } from '@/lib/omni-catalog'
import { inferActions } from '@/providers/actions'
import { searchImages } from '@/providers/images'
import { searchGifs } from '@/providers/gifs'
import { searchAudio } from '@/providers/audio'
import { searchEmojis, searchIcons } from '@/providers/emojis'
import { searchWidgets } from '@/providers/widgets'
import { searchLinks } from '@/providers/links'

type ProviderFn = (query: string, browse?: boolean) => Promise<{ section: OmniSection } | null>

const ALL_PROVIDERS: Record<OmniSearchFilter, ProviderFn[]> = {
  all: [
    inferActions as ProviderFn,
    searchImages,
    searchGifs,
    searchAudio,
    searchEmojis,
    searchIcons,
    searchWidgets,
    searchLinks,
  ],
  images: [searchImages],
  gifs: [searchGifs],
  audio: [searchAudio],
  emojis: [searchEmojis, searchIcons],
  widgets: [searchWidgets],
  links: [searchLinks],
  actions: [inferActions as ProviderFn],
}

const SECTION_ORDER = ['actions', 'images', 'gifs', 'audio', 'emojis', 'icons', 'widgets', 'links']

export async function runOmniSearch(
  query: string,
  filter: OmniSearchFilter = 'all',
): Promise<OmniSection[]> {
  const q = query.trim()
  const browse = q.length === 0
  if (browse && filter === 'all') return []

  const providers = ALL_PROVIDERS[filter] ?? ALL_PROVIDERS.all
  const settled = await Promise.allSettled(providers.map((fn) => fn(q, browse)))
  const sections: OmniSection[] = []

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value?.section.items.length) {
      sections.push(result.value.section)
    }
  }

  sections.sort((a, b) => SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id))
  return sections
}

export {
  inferActions,
  searchImages,
  searchGifs,
  searchAudio,
  searchEmojis,
  searchIcons,
  searchWidgets,
  searchLinks,
}
