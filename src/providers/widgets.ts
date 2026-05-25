import type { ProviderResult } from '@/providers/types'
import { searchCatalogWidgets, WIDGET_CATALOG } from '@/widgets/catalog'

const LIBRARY_LABEL = `Library · ${WIDGET_CATALOG.length} widgets`

export async function searchWidgets(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim()
  const matches = searchCatalogWidgets(q)
  if (matches.length === 0 && q.length < 2 && !browse) {
    return {
      section: {
        id: 'widgets',
        title: 'Widgets',
        source: LIBRARY_LABEL,
        items: searchCatalogWidgets('').slice(0, 18).map((w) => ({
          id: w.id,
          kind: 'widget' as const,
          title: w.name,
          subtitle: w.description,
          icon: w.icon,
          source: 'Library',
          payload: { catalogId: w.id },
        })),
        more: true,
      },
    }
  }
  if (matches.length === 0) return null

  return {
    section: {
      id: 'widgets',
      title: 'Widgets',
      source: LIBRARY_LABEL,
      items: matches.slice(0, 18).map((w) => ({
        id: w.id,
        kind: 'widget' as const,
        title: w.name,
        subtitle: w.description,
        icon: w.icon,
        source: 'Library',
        payload: { catalogId: w.id },
      })),
      more: matches.length > 18,
    },
  }
}
