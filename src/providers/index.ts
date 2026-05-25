import type { OmniSection } from '@/providers/types'
import type { OmniSearchFilter } from '@/lib/omni-catalog'
import { OMNI_BROWSE_QUERIES } from '@/lib/omni-catalog'
import { inferActions } from '@/providers/actions'
import { searchImages } from '@/providers/images'
import { searchGifs } from '@/providers/gifs'
import { searchAudio } from '@/providers/audio'
import { searchVideos } from '@/providers/videos'
import { searchAudioStreaming } from '@/providers/streaming-search'
import { searchYoutubeVideosSection } from '@/providers/streaming-search'
import { searchAudioWidgets } from '@/providers/audio-widgets'
import { searchEmojis, searchIcons } from '@/providers/emojis'
import { searchWidgets } from '@/providers/widgets'
import { searchPasteUrl } from '@/providers/link-helpers'
import { searchUniversalExtras } from '@/providers/universal-search'
import { searchTextTools } from '@/providers/text-tools'
import { searchShapes } from '@/providers/shapes-search'
import { searchThemes } from '@/providers/themes-search'

type ProviderFn = (query: string, browse?: boolean) => Promise<{ section: OmniSection } | null>

const ALL_PROVIDERS: Record<OmniSearchFilter, ProviderFn[]> = {
  all: [
    inferActions as ProviderFn,
    searchPasteUrl as ProviderFn,
    searchUniversalExtras,
    searchImages,
    searchGifs,
    searchVideos,
    searchYoutubeVideosSection,
    searchAudio,
    searchAudioStreaming,
    searchEmojis,
    searchIcons,
    searchWidgets,
    searchTextTools,
    searchThemes,
  ],
  images: [searchPasteUrl as ProviderFn, searchImages],
  gifs: [searchPasteUrl as ProviderFn, searchGifs],
  video: [searchPasteUrl as ProviderFn, searchYoutubeVideosSection, searchVideos],
  audio: [searchPasteUrl as ProviderFn, searchAudioStreaming, searchAudio, searchAudioWidgets],
  emojis: [searchEmojis, searchIcons],
  stickers: [searchEmojis, searchIcons],
  widgets: [searchWidgets],
  text: [searchTextTools],
  shapes: [searchShapes],
  themes: [searchThemes],
  actions: [inferActions as ProviderFn],
}

const SECTION_ORDER = [
  'actions',
  'paste-url',
  'themes',
  'text',
  'shapes',
  'images',
  'gifs',
  'youtube',
  'videos',
  'streaming',
  'audio',
  'audio-widgets',
  'emojis',
  'icons',
  'stickers',
  'widgets',
]

function shouldIncludeSection(section: OmniSection): boolean {
  return section.items.length > 0 || Boolean(section.error || section.needsKey)
}

export async function runOmniSearch(
  query: string,
  filter: OmniSearchFilter = 'all',
): Promise<OmniSection[]> {
  const q = query.trim()
  const browse = q.length === 0
  if (browse && filter === 'all') return []

  const effectiveQuery =
    browse && filter !== 'all' ? (OMNI_BROWSE_QUERIES[filter] ?? 'popular') : q

  const providers = ALL_PROVIDERS[filter] ?? ALL_PROVIDERS.all
  const settled = await Promise.allSettled(
    providers.map((fn) => fn(effectiveQuery, browse || effectiveQuery !== q)),
  )
  const sections: OmniSection[] = []

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value?.section) {
      const section = result.value.section
      if (shouldIncludeSection(section)) sections.push(section)
    }
  }

  sections.sort((a, b) => SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id))
  return sections
}

export {
  inferActions,
  searchImages,
  searchGifs,
  searchVideos,
  searchAudio,
  searchEmojis,
  searchIcons,
  searchWidgets,
  searchTextTools,
  searchShapes,
  searchThemes,
}
