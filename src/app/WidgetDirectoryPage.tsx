import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { WIDGET_CATALOG, WIDGET_CATEGORIES, searchCatalogWidgets } from '@/widgets/catalog'
import { createStandaloneWidget } from '@/lib/widget-store'
import { useAuthStore } from '@/store/auth.store'
import { StandaloneWidgetView } from '@/ui/StandaloneWidgetView'
import { DEFAULT_WIDGET_THEME, type WidgetInstance } from '@/types/widget-instance'
import { cn } from '@/lib/cn'

export function WidgetDirectoryPage() {
  const user = useAuthStore((s) => s.user)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [preview, setPreview] = useState<(typeof WIDGET_CATALOG)[number] | null>(null)
  const [creating, setCreating] = useState(false)

  const items = useMemo(() => {
    let list = query.trim() ? searchCatalogWidgets(query) : WIDGET_CATALOG
    if (category) list = list.filter((w) => w.category === category)
    return list.slice(0, 60)
  }, [query, category])

  const createFromCatalog = async (catalogId: string) => {
    setCreating(true)
    try {
      const widget = await createStandaloneWidget({
        ownerId: user?.id ?? 'local',
        ownerUsername: user?.username,
        widgetId: catalogId,
      })
      toast.success('Widget created!')
      window.location.href = `/w/${widget.id}/edit`
    } catch {
      toast.error('Could not create widget')
    } finally {
      setCreating(false)
    }
  }

  const previewInstance: WidgetInstance | null = preview
    ? {
        id: 'preview',
        ownerId: 'preview',
        widgetId: preview.id,
        name: preview.name,
        config: preview.config ?? {},
        size: { w: 280, h: 200 },
        theme: DEFAULT_WIDGET_THEME,
        visibility: 'public',
        createdAt: '',
        updatedAt: '',
        views: 0,
      }
    : null

  return (
    <div className="min-h-[100dvh] bg-[#050508] text-white">
      <header className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#beee1d]">Wall Widgets</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Drop a live widget anywhere</h1>
          <p className="mt-2 max-w-xl text-neutral-400">
            Standalone widgets with their own URL, embed code, and live image — perfect for READMEs, Notion, and personal sites.
          </p>
          <input
            type="search"
            placeholder="Search widgets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-6 w-full max-w-md rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#beee1d]/40"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn('rounded-full px-3 py-1 text-xs font-bold', !category ? 'bg-[#beee1d] text-black' : 'bg-white/5')}
            >
              All
            </button>
            {WIDGET_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  category === c.id ? 'bg-[#beee1d] text-black' : 'bg-white/5 text-neutral-400',
                )}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setPreview(w)}
            className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-[#beee1d]/30"
          >
            <span className="text-2xl">{w.icon}</span>
            <p className="mt-2 font-bold">{w.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{w.description}</p>
          </button>
        ))}
      </div>

      {preview && previewInstance && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <StandaloneWidgetView widget={previewInstance} />
            <p className="mt-4 font-bold">{preview.name}</p>
            <p className="text-sm text-neutral-400">{preview.description}</p>
            <button
              type="button"
              disabled={creating}
              onClick={() => void createFromCatalog(preview.id)}
              className="mt-4 w-full rounded-xl bg-[#beee1d] py-3 text-sm font-black text-black disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create yours →'}
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 py-8 text-center text-sm text-neutral-500">
        <Link to="/edit" className="text-[#beee1d] hover:underline">
          Or build a full wall →
        </Link>
      </footer>
    </div>
  )
}
