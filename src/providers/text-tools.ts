import type { OmniItem, ProviderResult } from '@/providers/types'
import { wallActions } from '@/editor/wall-actions'
import { searchCatalogWidgets } from '@/widgets/catalog'

function actionItem(id: string, title: string, subtitle: string, icon: string, run: () => void): OmniItem {
  return {
    id,
    kind: 'action',
    title,
    subtitle,
    icon,
    source: 'Wall',
    payload: { run },
  }
}

export async function searchTextTools(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  const items: OmniItem[] = []

  if (!q || browse || /text|type|note|sticky|label|heading|title|font/.test(q)) {
    items.push(
      actionItem('text-box', 'Add text box', 'Editable headline or body copy', 'T', () =>
        wallActions.addTextBox('Type here'),
      ),
      actionItem('sticky-yellow', 'Add sticky note', 'Classic yellow sticky', '📝', () =>
        wallActions.addSticky('Note', 'yellow'),
      ),
      actionItem('sticky-green', 'Add green sticky', 'Highlight or task note', '📗', () =>
        wallActions.addSticky('Task', 'light-green'),
      ),
    )
  }

  const widgetQuery = q || (browse ? 'text note heading quote' : '')
  const widgets = searchCatalogWidgets(widgetQuery).filter(
    (w) =>
      w.template === 'sticky' ||
      w.category === 'productivity' ||
      /text|note|heading|quote|list|todo|title/.test(
        `${w.name} ${w.description} ${w.tags.join(' ')}`.toLowerCase(),
      ),
  )

  for (const w of widgets.slice(0, 16)) {
    items.push({
      id: w.id,
      kind: 'widget',
      title: w.name,
      subtitle: w.description,
      icon: w.icon,
      source: 'Library',
      payload: { catalogId: w.id },
    })
  }

  if (items.length === 0) {
    return {
      section: {
        id: 'text',
        title: 'Text & notes',
        source: 'Wall',
        error: q ? `No text tools for "${q}". Try quick tags or "sticky".` : 'Type to search text tools.',
        items: [],
      },
    }
  }

  return {
    section: {
      id: 'text',
      title: 'Text & notes',
      source: 'Wall + library',
      items: items.slice(0, 20),
      more: items.length > 20,
    },
  }
}
