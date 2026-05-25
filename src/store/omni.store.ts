import { create } from 'zustand'
import type { OmniSection } from '@/providers/types'
import { runOmniSearch } from '@/providers/index'
import { debounce } from '@/lib/cn'
import {
  OMNI_PLACEHOLDERS,
  omniFilterPlaceholder,
  type OmniSearchFilter,
} from '@/lib/omni-catalog'

type OmniState = {
  open: boolean
  query: string
  filter: OmniSearchFilter
  sections: OmniSection[]
  loading: boolean
  activeIndex: number
  placeholderIdx: number
  setOpen: (open: boolean) => void
  setQuery: (query: string) => void
  setFilter: (filter: OmniSearchFilter) => void
  setActiveIndex: (idx: number) => void
  tickPlaceholder: () => void
  search: (query: string) => Promise<void>
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
  }, 200)

  return {
    open: false,
    query: '',
    filter: 'all',
    sections: [],
    loading: false,
    activeIndex: 0,
    placeholderIdx: 0,
    setOpen: (open) => set({ open }),
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
    tickPlaceholder: () =>
      set((s) => ({ placeholderIdx: (s.placeholderIdx + 1) % OMNI_PLACEHOLDERS.length })),
    search: async (query) => {
      const filter = get().filter
      set({ loading: true, query })
      const sections = await runOmniSearch(query, filter)
      set({ sections, loading: false, activeIndex: 0 })
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
