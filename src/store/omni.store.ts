import { create } from 'zustand'
import type { OmniSection } from '@/providers/types'
import { runOmniSearch } from '@/providers/index'
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

let searchDebounced: ((q: string, filter: OmniSearchFilter) => void) | null = null

export const useOmniStore = create<OmniState>((set, get) => {
  const runSearch = async (q: string, filter: OmniSearchFilter) => {
    set({ loading: true })
    const sections = await runOmniSearch(q, filter)
    set({ sections, loading: false, activeIndex: 0 })
  }

  searchDebounced = debounce((q: string, filter: OmniSearchFilter) => {
    void runSearch(q, filter)
  }, 220)

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
    setOpen: (open) => {
      set({ open })
      if (open) void runSearch(get().query, get().filter)
    },
    setFilter: (filter) => {
      set({ filter })
      const { query } = get()
      void runSearch(query, filter)
    },
    setQuery: (query) => {
      const filter = get().filter
      set({ query })
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
      const { query, filter } = get()
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
