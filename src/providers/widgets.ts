import type { ProviderResult } from '@/providers/types'
import { searchCatalogWidgets, WIDGET_CATALOG } from '@/widgets/catalog'
import { buildPasteUrlItem, searchServiceWidgets } from '@/providers/link-helpers'

const LIBRARY_LABEL = `Library · ${WIDGET_CATALOG.length} widgets`

function toWidgetItems(
  matches: ReturnType<typeof searchCatalogWidgets>,
) {
  return matches.map((w) => ({
    id: w.id,
    kind: 'widget' as const,
    title: w.name,
    subtitle: w.description,
    icon: w.icon,
    source: w.category === 'links' ? 'Link widget' : 'Library',
    payload: { catalogId: w.id },
  }))
}

export async function searchWidgets(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim()
  const paste = buildPasteUrlItem(q)
  const services = searchServiceWidgets(q, browse || q.length < 2)
  const matches = searchCatalogWidgets(q)

  const items = [
    ...(paste ? [paste] : []),
    ...services,
    ...toWidgetItems(matches),
  ]

  const seen = new Set<string>()
  const deduped = items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  if (deduped.length === 0 && q.length < 2 && !browse) {
    return {
      section: {
        id: 'widgets',
        title: 'Widgets & services',
        source: LIBRARY_LABEL,
        items: [
          ...searchServiceWidgets('', true),
          ...toWidgetItems(searchCatalogWidgets('').slice(0, 14)),
        ].slice(0, 20),
        more: true,
      },
    }
  }
  if (deduped.length === 0) return null

  return {
    section: {
      id: 'widgets',
      title: 'Widgets & services',
      source: [paste && 'Paste URL', 'Notion · GitHub · QR · tools', LIBRARY_LABEL]
        .filter(Boolean)
        .join(' · '),
      items: deduped.slice(0, 22),
      more: deduped.length > 22,
    },
  }
}
