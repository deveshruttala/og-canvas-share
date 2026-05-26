import type { OmniItem, ProviderResult } from '@/providers/types'
import { wallActions } from '@/editor/wall-actions'
import { searchCatalogWidgets } from '@/widgets/catalog'

function actionItem(
  id: string,
  title: string,
  subtitle: string,
  icon: string,
  run: () => void,
): OmniItem {
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

type TextEntry = {
  id: string
  title: string
  subtitle: string
  icon: string
  keywords: string
  run: () => void
}

const TEXT_ENTRIES: TextEntry[] = [
  {
    id: 'text-h1',
    title: 'Heading 1',
    subtitle: 'Bold display headline',
    icon: 'H1',
    keywords: 'h1 heading title display headline big',
    run: () =>
      wallActions.addTextBox('Heading', undefined, undefined, { size: '3xl', font: 'sans' }),
  },
  {
    id: 'text-h2',
    title: 'Heading 2',
    subtitle: 'Section title',
    icon: 'H2',
    keywords: 'h2 heading section title',
    run: () =>
      wallActions.addTextBox('Section title', undefined, undefined, { size: '2xl', font: 'sans' }),
  },
  {
    id: 'text-h3',
    title: 'Heading 3',
    subtitle: 'Smaller subhead',
    icon: 'H3',
    keywords: 'h3 heading subhead',
    run: () =>
      wallActions.addTextBox('Subheading', undefined, undefined, { size: 'xl', font: 'sans' }),
  },
  {
    id: 'text-body',
    title: 'Body text',
    subtitle: 'Regular paragraph',
    icon: 'T',
    keywords: 'body paragraph copy text',
    run: () => wallActions.addTextBox('Body text', undefined, undefined, { size: 'm', font: 'sans' }),
  },
  {
    id: 'text-quote',
    title: 'Quote',
    subtitle: 'Pull quote in serif italic',
    icon: '“”',
    keywords: 'quote pullquote citation testimonial',
    run: () =>
      wallActions.addTextBox(
        '“The best way to predict the future is to invent it.”',
        undefined,
        undefined,
        { mode: 'card', font: 'serif', size: 'l' },
      ),
  },
  {
    id: 'text-callout',
    title: 'Callout',
    subtitle: 'Highlight an important note',
    icon: '⚡',
    keywords: 'callout highlight info note alert tip',
    run: () =>
      wallActions.addTextBox('💡 Tip — write something worth noticing.', undefined, undefined, {
        mode: 'card',
        size: 'm',
      }),
  },
  {
    id: 'text-list-bullet',
    title: 'Bullet list',
    subtitle: 'Three-item dotted list',
    icon: '•',
    keywords: 'list bullet items todo',
    run: () =>
      wallActions.addTextBox('• First item\n• Second item\n• Third item', undefined, undefined, {
        size: 'm',
      }),
  },
  {
    id: 'text-list-numbered',
    title: 'Numbered list',
    subtitle: 'Three-step ordered list',
    icon: '1.',
    keywords: 'list numbered ordered steps',
    run: () =>
      wallActions.addTextBox('1. First step\n2. Second step\n3. Third step', undefined, undefined, {
        size: 'm',
      }),
  },
  {
    id: 'text-divider',
    title: 'Divider',
    subtitle: 'Horizontal section break',
    icon: '—',
    keywords: 'divider line break separator hr rule',
    run: () =>
      wallActions.addTextBox('————————————————', undefined, undefined, {
        size: 'l',
        textAlign: 'middle',
      }),
  },
  {
    id: 'text-code',
    title: 'Code block',
    subtitle: 'Monospaced snippet',
    icon: '</>',
    keywords: 'code snippet mono terminal kbd',
    run: () =>
      wallActions.addTextBox('npm run dev', undefined, undefined, { mode: 'card', font: 'mono', size: 'm' }),
  },
  {
    id: 'text-box',
    title: 'Add text box',
    subtitle: 'Empty editable text',
    icon: 'T',
    keywords: 'text textbox type note',
    run: () => wallActions.addTextBox('Type here'),
  },
  {
    id: 'sticky-yellow',
    title: 'Sticky note · yellow',
    subtitle: 'Classic yellow sticky',
    icon: '📝',
    keywords: 'sticky yellow note',
    run: () => wallActions.addSticky('Note', 'yellow'),
  },
  {
    id: 'sticky-green',
    title: 'Sticky note · green',
    subtitle: 'Task or highlight',
    icon: '📗',
    keywords: 'sticky green task',
    run: () => wallActions.addSticky('Task', 'light-green'),
  },
  {
    id: 'sticky-blue',
    title: 'Sticky note · blue',
    subtitle: 'Quiet aside or thought',
    icon: '🟦',
    keywords: 'sticky blue note',
    run: () => wallActions.addSticky('Note', 'light-blue'),
  },
  {
    id: 'sticky-violet',
    title: 'Sticky note · violet',
    subtitle: 'Idea or reminder',
    icon: '🟪',
    keywords: 'sticky violet purple idea',
    run: () => wallActions.addSticky('Idea', 'light-violet'),
  },
]

function entryHay(e: TextEntry): string {
  return `${e.title} ${e.subtitle} ${e.keywords}`.toLowerCase()
}

export async function searchTextTools(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  const items: OmniItem[] = []

  const showAll = !q || browse
  const matched = showAll
    ? TEXT_ENTRIES
    : TEXT_ENTRIES.filter((e) => q.split(/\s+/).every((tok) => entryHay(e).includes(tok)))

  // If user typed a niche query like "spotify" that doesn't match any text tool,
  // still show the top 3 defaults under text — keeps the section useful, not empty.
  const fallback = matched.length === 0 && q ? TEXT_ENTRIES.slice(0, 3) : matched
  for (const e of fallback) {
    items.push(actionItem(e.id, e.title, e.subtitle, e.icon, e.run))
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
