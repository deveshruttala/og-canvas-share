import { create } from 'zustand'
import type { OmniSection } from '@/providers/types'
import { runOmniSearch } from '@/providers/index'
import { debounce } from '@/lib/cn'

type OmniState = {
  open: boolean
  query: string
  sections: OmniSection[]
  loading: boolean
  activeIndex: number
  placeholderIdx: number
  setOpen: (open: boolean) => void
  setQuery: (query: string) => void
  setActiveIndex: (idx: number) => void
  tickPlaceholder: () => void
  search: (query: string) => Promise<void>
}

const PLACEHOLDERS = [
  'Add anything, ask anything…',
  'Try: a sunset photo',
  'Try: lofi piano clip',
  'Try: make this look cozier',
  'Try: GitHub stats widget',
]

let searchDebounced: ((q: string) => void) | null = null

export const useOmniStore = create<OmniState>((set) => {
  searchDebounced = debounce((q: string) => {
    void (async () => {
      set({ loading: true })
      const sections = await runOmniSearch(q)
      set({ sections, loading: false, activeIndex: 0 })
    })()
  }, 200)

  return {
    open: false,
    query: '',
    sections: [],
    loading: false,
    activeIndex: 0,
    placeholderIdx: 0,
    setOpen: (open) => set({ open }),
    setQuery: (query) => {
      set({ query })
      searchDebounced?.(query)
    },
    setActiveIndex: (activeIndex) => set({ activeIndex }),
    tickPlaceholder: () =>
      set((s) => ({ placeholderIdx: (s.placeholderIdx + 1) % PLACEHOLDERS.length })),
    search: async (query) => {
      set({ loading: true, query })
      const sections = await runOmniSearch(query)
      set({ sections, loading: false, activeIndex: 0 })
    },
  }
})

export function getOmniPlaceholders() {
  return PLACEHOLDERS
}

export function flattenOmniItems(sections: OmniSection[]) {
  return sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionId: s.id })))
}
