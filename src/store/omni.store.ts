import { create } from 'zustand'
import type { OmniSection } from '@/providers/types'
import {
  runOmniSearch,
  runOmniSearchStreaming,
  invalidateOmniCacheFor,
} from '@/providers/index'
import { debounce } from '@/lib/cn'
import {
  OMNI_PLACEHOLDERS,
  omniFilterPlaceholder,
  type OmniSearchFilter,
  type OmniThumbCols,
} from '@/lib/omni-catalog'

const RECENT_KEY = 'wall_omni_recent'
const MAX_RECENT = 10

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {
    /* ignore */
  }
}

type OmniState = {
  open: boolean
  query: string
  filter: OmniSearchFilter
  sections: OmniSection[]
  loading: boolean
  activeIndex: number
  placeholderIdx: number
  thumbCols: OmniThumbCols
  recentQueries: string[]
  /**
   * Incremented every time the user clicks refresh. Drives a deterministic
   * shuffle of media-section items so each click visibly surfaces different
   * results — even when upstream APIs return the same payload.
   */
  refreshSeed: number
  setOpen: (open: boolean) => void
  setQuery: (query: string) => void
  setFilter: (filter: OmniSearchFilter) => void
  setActiveIndex: (idx: number) => void
  setThumbCols: (cols: OmniThumbCols) => void
  tickPlaceholder: () => void
  pushRecentQuery: (query: string) => void
  clearRecent: () => void
  search: (query: string) => Promise<void>
  refresh: () => Promise<void>
}

const SHUFFLE_SECTION_IDS = new Set(['images', 'gifs', 'videos', 'audio', 'icons'])

/** Mulberry32 — tiny, deterministic, seeded PRNG. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleSectionsForRefresh(sections: OmniSection[], seed: number): OmniSection[] {
  if (seed === 0) return sections
  const rng = makeRng(seed)
  return sections.map((section) => {
    if (!SHUFFLE_SECTION_IDS.has(section.id)) return section
    const items = section.items.slice()
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = items[i]
      items[i] = items[j]
      items[j] = tmp
    }
    return { ...section, items }
  })
}

let searchDebounced: ((q: string, filter: OmniSearchFilter) => void) | null = null

export const useOmniStore = create<OmniState>((set, get) => {
  // Race-guard: only the most recently-issued search may write back.
  let searchToken = 0

  const runSearch = async (q: string, filter: OmniSearchFilter) => {
    const myToken = ++searchToken
    set({ loading: true })

    await runOmniSearchStreaming(
      q,
      filter,
      (localSections) => {
        if (myToken !== searchToken) return
        const seed = get().refreshSeed
        // First paint: show local provider results immediately.
        set({
          sections: shuffleSectionsForRefresh(localSections, seed),
          activeIndex: 0,
        })
      },
      (finalSections) => {
        if (myToken !== searchToken) return
        const seed = get().refreshSeed
        set({
          sections: shuffleSectionsForRefresh(finalSections, seed),
          loading: false,
          activeIndex: 0,
        })
      },
    )
  }

  // Snappier typing — locals will appear within a single frame anyway.
  searchDebounced = debounce((q: string, filter: OmniSearchFilter) => {
    void runSearch(q, filter)
  }, 140)

  return {
    open: false,
    query: '',
    filter: 'all',
    sections: [],
    loading: false,
    activeIndex: 0,
    placeholderIdx: 0,
    thumbCols: 5,
    recentQueries: loadRecent(),
    refreshSeed: 0,
    setOpen: (open) => {
      set({ open })
      if (open) void runSearch(get().query, get().filter)
    },
    setFilter: (filter) => {
      // New filter → reset shuffle so the new section starts in natural order.
      set({ filter, refreshSeed: 0 })
      const { query } = get()
      void runSearch(query, filter)
    },
    setQuery: (query) => {
      const filter = get().filter
      // New query → reset shuffle.
      set({ query, refreshSeed: 0 })
      searchDebounced?.(query, filter)
    },
    setActiveIndex: (activeIndex) => set({ activeIndex }),
    setThumbCols: (thumbCols) => set({ thumbCols }),
    tickPlaceholder: () =>
      set((s) => ({ placeholderIdx: (s.placeholderIdx + 1) % OMNI_PLACEHOLDERS.length })),
    pushRecentQuery: (query) => {
      const trimmed = query.trim()
      if (trimmed.length < 2) return
      const next = [trimmed, ...get().recentQueries.filter((r) => r !== trimmed)].slice(0, MAX_RECENT)
      saveRecent(next)
      set({ recentQueries: next })
    },
    clearRecent: () => {
      saveRecent([])
      set({ recentQueries: [] })
    },
    search: async (query) => {
      const filter = get().filter
      set({ loading: true, query })
      const sections = await runOmniSearch(query, filter)
      set({ sections, loading: false, activeIndex: 0 })
    },
    refresh: async () => {
      const { query, filter, refreshSeed } = get()
      // Bump the seed so the shuffle picks a different ordering, and
      // invalidate the in-memory cache so we actually re-fetch from APIs.
      set({ refreshSeed: refreshSeed + 1 })
      invalidateOmniCacheFor(query, filter)
      await runSearch(query, filter)
    },
  }
})

export function getOmniPlaceholders(filter: OmniSearchFilter = 'all') {
  if (filter !== 'all') return [omniFilterPlaceholder(filter), ...OMNI_PLACEHOLDERS.slice(1)]
  return OMNI_PLACEHOLDERS
}

export function flattenOmniItems(sections: OmniSection[]) {
  return sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionId: s.id })))
}
