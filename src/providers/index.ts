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

/**
 * Local (synchronous, no-network) providers. Used as the curated default when
 * the user focuses the search bar with no query (filter='all'). Keeps initial
 * focus snappy and always shows useful content instead of an empty panel.
 *
 * Also used by `runOmniSearchStreaming` as the fast first phase so the panel
 * can render usable results while remote APIs (Giphy/Pexels/Spotify/etc.)
 * are still pending.
 */
const LOCAL_BROWSE_PROVIDERS: ProviderFn[] = [
  inferActions as ProviderFn,
  searchThemes,
  searchTextTools,
  searchWidgets,
  searchShapes,
  searchEmojis,
]

const LOCAL_PROVIDER_SET = new Set(LOCAL_BROWSE_PROVIDERS)

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

/**
 * In-memory LRU search cache. Identical (query, filter) pairs return the
 * cached result for 60s — prevents hammering rate-limited free APIs
 * (Openverse, Wikipedia, IA) when the user retypes the same term.
 */
const CACHE_TTL_MS = 60_000
const CACHE_LIMIT = 40
type CacheEntry = { sections: OmniSection[]; expiresAt: number }
const searchCache = new Map<string, CacheEntry>()

function cacheKey(q: string, filter: OmniSearchFilter): string {
  return `${filter}::${q.trim().toLowerCase()}`
}

function cacheGet(q: string, filter: OmniSearchFilter): OmniSection[] | null {
  const key = cacheKey(q, filter)
  const entry = searchCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    searchCache.delete(key)
    return null
  }
  // LRU touch
  searchCache.delete(key)
  searchCache.set(key, entry)
  return entry.sections
}

function cacheSet(q: string, filter: OmniSearchFilter, sections: OmniSection[]) {
  const key = cacheKey(q, filter)
  if (searchCache.size >= CACHE_LIMIT) {
    const oldest = searchCache.keys().next().value
    if (oldest) searchCache.delete(oldest)
  }
  searchCache.set(key, { sections, expiresAt: Date.now() + CACHE_TTL_MS })
}

/** Clear cached entries for one (query, filter) so the next search re-fetches. */
export function invalidateOmniCacheFor(q: string, filter: OmniSearchFilter) {
  searchCache.delete(cacheKey(q, filter))
}

/** Drop the whole cache (e.g. when network state changes). */
export function clearOmniSearchCache() {
  searchCache.clear()
}

export async function runOmniSearch(
  query: string,
  filter: OmniSearchFilter = 'all',
): Promise<OmniSection[]> {
  const q = query.trim()
  const browse = q.length === 0

  // Don't cache empty 'all' (local-only, already fast); cache real queries.
  const useCache = !(browse && filter === 'all')
  if (useCache) {
    const hit = cacheGet(q, filter)
    if (hit) return hit
  }

  const effectiveQuery =
    browse && filter !== 'all' ? (OMNI_BROWSE_QUERIES[filter] ?? 'popular') : q

  // Empty query + 'all' filter → only run local fast providers so the panel
  // shows curated themes/widgets/text-tools/shapes/emojis instantly on focus,
  // without pinging Giphy/Pexels/etc.
  const providers =
    browse && filter === 'all'
      ? LOCAL_BROWSE_PROVIDERS
      : (ALL_PROVIDERS[filter] ?? ALL_PROVIDERS.all)
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
  if (useCache) cacheSet(q, filter, sections)
  return sections
}

/**
 * Two-phase search: invoke `onLocal` immediately with the fast local providers,
 * then invoke `onFull` once the remote providers (images/gifs/video/audio APIs)
 * resolve. Keeps the panel responsive on the first keystroke.
 *
 * Returns the same final array as `runOmniSearch` once both phases are done.
 */
export async function runOmniSearchStreaming(
  query: string,
  filter: OmniSearchFilter,
  onLocal: (sections: OmniSection[]) => void,
  onFull: (sections: OmniSection[]) => void,
): Promise<OmniSection[]> {
  const q = query.trim()
  const browse = q.length === 0
  const effectiveQuery =
    browse && filter !== 'all' ? (OMNI_BROWSE_QUERIES[filter] ?? 'popular') : q

  // Cache hit → both callbacks get the cached payload immediately.
  if (!(browse && filter === 'all')) {
    const hit = cacheGet(q, filter)
    if (hit) {
      onLocal(hit)
      onFull(hit)
      return hit
    }
  }

  // 'all' + browse: only local providers, no remote phase.
  if (browse && filter === 'all') {
    const result = await runOmniSearch(query, filter)
    onLocal(result)
    onFull(result)
    return result
  }

  const providers = ALL_PROVIDERS[filter] ?? ALL_PROVIDERS.all
  const local = providers.filter((p) => LOCAL_PROVIDER_SET.has(p))
  const remote = providers.filter((p) => !LOCAL_PROVIDER_SET.has(p))

  const buildSections = (settled: PromiseSettledResult<{ section: OmniSection } | null>[]) => {
    const out: OmniSection[] = []
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value?.section) {
        const section = r.value.section
        if (shouldIncludeSection(section)) out.push(section)
      }
    }
    out.sort((a, b) => SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id))
    return out
  }

  const localSettled = await Promise.allSettled(
    local.map((fn) => fn(effectiveQuery, browse || effectiveQuery !== q)),
  )
  const localSections = buildSections(localSettled)
  onLocal(localSections)

  // Race remote providers against a soft cap so slow ones (IA metadata fetches,
  // overloaded free APIs) don't keep the loading spinner pinned for 8+ seconds.
  // Providers that miss the cap still resolve in the background; we then call
  // onFull a second time so the panel hydrates with the additional results.
  const REMOTE_CAP_MS = 4000
  const remotePromise = Promise.allSettled(
    remote.map((fn) => fn(effectiveQuery, browse || effectiveQuery !== q)),
  )

  let resolvedEarly = false
  const earlyCap = new Promise<{ settled: PromiseSettledResult<{ section: OmniSection } | null>[]; partial: true }>(
    (resolve) =>
      setTimeout(
        () =>
          resolve({
            settled: remote.map(
              () =>
                ({ status: 'fulfilled', value: null }) as PromiseSettledResult<{
                  section: OmniSection
                } | null>,
            ),
            partial: true,
          }),
        REMOTE_CAP_MS,
      ),
  )
  const fullRace = remotePromise.then((s) => ({ settled: s, partial: false as const }))
  const first = await Promise.race([fullRace, earlyCap])

  const buildAndEmit = (
    settled: PromiseSettledResult<{ section: OmniSection } | null>[],
  ): OmniSection[] => {
    const out = buildSections([...localSettled, ...settled])
    cacheSet(q, filter, out)
    onFull(out)
    return out
  }

  if (!first.partial) {
    return buildAndEmit(first.settled)
  }
  resolvedEarly = true
  buildAndEmit(first.settled)

  // Late remote results land here — re-emit so the UI hydrates with image/gif/video
  // sections that missed the cap, instead of forcing the user to refresh.
  void remotePromise.then((late) => {
    if (resolvedEarly) buildAndEmit(late)
  })
  return buildSections([...localSettled, ...first.settled])
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
