import type { OmniItem, ProviderResult } from '@/providers/types'
import { wallActions } from '@/editor/wall-actions'
import { searchCatalogWidgets } from '@/widgets/catalog'
import { useUiStore } from '@/store/ui.store'

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

export async function searchShapes(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  const items: OmniItem[] = []

  if (!q || browse || /shape|draw|geo|arrow|frame|line|circle|rect/.test(q)) {
    items.push(
      actionItem('draw', 'Draw scribble', 'Freehand pen on the canvas', '✏️', () =>
        useUiStore.getState().setTool('drawing'),
      ),
      actionItem('arrange', 'Auto-arrange', 'Tidy overlapping items', '📐', () => wallActions.autoArrange()),
      actionItem('poll', 'Quick poll', 'Emoji vote widget', '🗳️', () =>
        wallActions.addPoll('What do you think?', [
          { id: 'a', emoji: '🔥', label: 'Love it' },
          { id: 'b', emoji: '🤔', label: 'Maybe' },
          { id: 'c', emoji: '👀', label: 'Watching' },
        ]),
      ),
      actionItem('map', 'Map pin', 'Where I am (OSM)', '📍', () =>
        wallActions.addMap(51.5074, -0.1278, 'London'),
      ),
    )
  }

  const widgetQuery = q || (browse ? 'frame arrow divider border' : '')
  const widgets = searchCatalogWidgets(widgetQuery).filter((w) =>
    /shape|frame|arrow|divider|border|line|circle|badge|card|grid/.test(
      `${w.name} ${w.description} ${w.tags.join(' ')} ${w.category}`.toLowerCase(),
    ),
  )

  for (const w of widgets.slice(0, 18)) {
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
        id: 'shapes',
        title: 'Shapes & layout',
        source: 'Wall',
        error: q ? `No shapes for "${q}". Try "arrow" or "frame".` : 'Type to search shapes.',
        items: [],
      },
    }
  }

  return {
    section: {
      id: 'shapes',
      title: 'Shapes & layout',
      source: 'Wall + library',
      items: items.slice(0, 22),
      more: items.length > 22,
    },
  }
}
