import { useMemo, useRef, useState } from 'react'
import { X, Search, Upload } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import {
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  parseWidgetFile,
  searchCatalogWidgets,
  type CatalogWidget,
  type CatalogWidgetCategory,
} from '@/widgets/catalog'
import { WidgetCard } from '@/ui/WidgetCard'
import { insertCatalogWidgetFromLibrary } from '@/lib/omni-insert'
import toast from 'react-hot-toast'

export function WidgetPicker() {
  const open = useUiStore((s) => s.showWidgetPicker)
  const setOpen = useUiStore((s) => s.setShowWidgetPicker)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CatalogWidgetCategory | 'all'>('all')
  const fileRef = useRef<HTMLInputElement>(null)

  const widgets = useMemo(() => {
    let list = searchCatalogWidgets(query)
    if (category !== 'all') list = list.filter((w) => w.category === category)
    return list
  }, [query, category])

  const add = (w: CatalogWidget) => {
    insertCatalogWidgetFromLibrary(w)
    toast.success(`Added ${w.name}`)
    setOpen(false)
  }

  const importFile = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = parseWidgetFile(text)
      add(parsed.widget)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid widget file')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[min(720px,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--bg-muted)] px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-[var(--text-primary)]">Widget Library</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {WIDGET_CATALOG.length} curated widgets · import .wallwidget from desktop
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-[var(--bg-muted)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--bg-subtle)]"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".wallwidget,.json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void importFile(f)
                e.target.value = ''
              }}
            />
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-subtle)]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="w-44 shrink-0 overflow-y-auto border-r border-[var(--bg-muted)] p-3">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                category === 'all' ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]' : 'hover:bg-[var(--bg-subtle)]'
              }`}
            >
              All ({WIDGET_CATALOG.length})
            </button>
            {WIDGET_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-xs ${
                  category === c.id ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-text)]' : 'hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-[var(--bg-muted)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 100 widgets…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
              {widgets.map((w) => (
                <WidgetCard key={w.id} widget={w} onClick={() => add(w)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
