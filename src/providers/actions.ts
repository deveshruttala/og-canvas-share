import type { ProviderResult } from '@/providers/types'
import { matchThemeCommand, searchActionCatalog } from '@/providers/action-catalog'
import { useOmniStore } from '@/store/omni.store'

export async function inferActions(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim()
  const items = searchActionCatalog(q, browse || !q)

  const themeItem = q ? matchThemeCommand(q) : null
  if (themeItem) items.unshift(themeItem)

  const addMatch = q.toLowerCase().match(/^add (?:a |an )?(.+)/)
  if (addMatch?.[1]) {
    const topic = addMatch[1]
    items.unshift({
      id: `action-search-images-${topic}`,
      kind: 'action',
      title: `Search images for “${topic}”`,
      subtitle: 'Open image search',
      icon: '🖼️',
      source: 'Wall',
      payload: {
        run: () => {
          useOmniStore.getState().setFilter('images')
          useOmniStore.getState().setOpen(true)
          useOmniStore.getState().setQuery(topic)
        },
      },
    })
  }

  return {
    section: {
      id: 'actions',
      title: 'Suggested actions',
      source: `${items.length} commands`,
      items: items.slice(0, 20),
      more: items.length > 20,
    },
  }
}
