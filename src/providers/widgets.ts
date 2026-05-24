import type { ProviderResult } from '@/providers/types'
import { searchCatalogWidgets } from '@/widgets/catalog'

export async function searchWidgets(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  const matches = searchCatalogWidgets(q)
  if (matches.length === 0 && q.length < 2) {
    return {
      section: {
        id: 'widgets',
        title: 'Widgets',
        source: 'Library · 100 widgets',
        items: searchCatalogWidgets('').slice(0, 8).map((w) => ({
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
      source: 'Library · 100 widgets',
      items: matches.slice(0, 8).map((w) => ({
        id: w.id,
        kind: 'widget' as const,
        title: w.name,
        subtitle: w.description,
        icon: w.icon,
        source: 'Library',
        payload: { catalogId: w.id },
      })),
      more: matches.length > 8,
    },
  }
}
