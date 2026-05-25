import { useMemo } from 'react'
import { Loader2, Plus } from 'lucide-react'
import type { OmniSection } from '@/providers/types'
import { flattenOmniItems, useOmniStore } from '@/store/omni.store'
import { OMNI_SEARCH_FILTERS, OMNI_SECTION_HELP } from '@/lib/omni-catalog'
import { WIDGET_CATALOG } from '@/widgets/catalog'
import { insertOmniItem } from '@/lib/omni-insert'
import { useUiStore } from '@/store/ui.store'
import { cn } from '@/lib/cn'
import { OmniThumb } from '@/ui/OmniThumb'

type Props = {
  sections: OmniSection[]
  loading: boolean
  activeIndex: number
  onSelectIndex: (i: number) => void
  onClose: () => void
}

function OmniFilterTabs() {
  const filter = useOmniStore((s) => s.filter)
  const setFilter = useOmniStore((s) => s.setFilter)
  const setOpen = useOmniStore((s) => s.setOpen)

  return (
    <div className="omni-filter-row omni-filter-row-panel" role="tablist" aria-label="Search category">
      {OMNI_SEARCH_FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={filter === f.id}
          title={f.hint}
          className={cn('omni-filter-chip', filter === f.id && 'omni-filter-chip-active')}
          onClick={() => {
            setFilter(f.id)
            setOpen(true)
          }}
        >
          <span aria-hidden>{f.emoji}</span> {f.label}
        </button>
      ))}
    </div>
  )
}

export function OmniResults({ sections, loading, activeIndex, onSelectIndex, onClose }: Props) {
  const filter = useOmniStore((s) => s.filter)
  const flat = useMemo(() => flattenOmniItems(sections), [sections])
  const sectionStarts = useMemo(() => {
    const starts: number[] = []
    let offset = 0
    for (const section of sections) {
      starts.push(offset)
      offset += section.items.length
    }
    return starts
  }, [sections])

  const pick = async (idx: number) => {
    const item = flat[idx]
    if (!item) return
    await insertOmniItem(item)
    onClose()
    useOmniStore.getState().setQuery('')
    useOmniStore.getState().setOpen(false)
  }

  if (!sections.length && !loading) {
    return (
      <div className="omni-results-panel">
        <OmniFilterTabs />
        <p className="px-4 py-6 text-center text-sm text-white/50">
          {filter === 'all'
            ? 'Pick a category above or type to search images, GIFs, audio, emojis, widgets, and links.'
            : `Type to search ${filter}, or browse popular results when the field is empty.`}
        </p>
        <button
          type="button"
          className="mx-4 mb-3 text-left text-xs text-[#beee1d] hover:underline"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowWidgetPicker(true)
          }}
        >
          Browse widget library ({WIDGET_CATALOG.length} widgets) →
        </button>
      </div>
    )
  }

  return (
    <div className="omni-results-panel">
      <OmniFilterTabs />
      {sections.map((section, sectionIndex) => {
        const startIdx = sectionStarts[sectionIndex] ?? 0
        return (
          <section key={section.id} className="omni-results-section">
            <header className="omni-results-section-head">
              <div className="min-w-0">
                <span className="block font-semibold">
                  ▸ {OMNI_SECTION_HELP[section.id]?.title ?? section.title}
                </span>
                {OMNI_SECTION_HELP[section.id]?.description && (
                  <span className="mt-0.5 block text-[10px] font-normal text-white/40">
                    {OMNI_SECTION_HELP[section.id].description}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-right text-[var(--text-tertiary)]">
                {section.source}
                {section.more ? ' · more' : ''}
              </span>
            </header>

            {section.error && (
              <p className="omni-results-hint text-amber-200/90">{section.error}</p>
            )}

            {section.needsKey && !section.error && (
              <p className="omni-results-hint">
                Optional: connect {section.needsKey} in Connections for higher-quality results
              </p>
            )}

            {section.items.length === 0 && section.error ? null : section.id === 'images' || section.id === 'gifs' ? (
              <div className="omni-thumb-grid">
                {section.items.map((item, i) => {
                  const idx = startIdx + i
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn('omni-thumb', activeIndex === idx && 'omni-thumb-active')}
                      onMouseEnter={() => onSelectIndex(idx)}
                      onClick={() => void pick(idx)}
                    >
                      {item.thumb ? <OmniThumb src={item.thumb} alt={item.title} /> : null}
                      <span className="omni-thumb-add">
                        <Plus className="h-3 w-3" />
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : section.id === 'emojis' || section.id === 'icons' ? (
              <div className="omni-emoji-row">
                {section.items.map((item, i) => {
                  const idx = startIdx + i
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn('omni-emoji-btn', activeIndex === idx && 'omni-emoji-btn-active')}
                      onMouseEnter={() => onSelectIndex(idx)}
                      onClick={() => void pick(idx)}
                      title={item.title}
                    >
                      {item.emoji ?? item.icon}
                    </button>
                  )
                })}
              </div>
            ) : (
              <ul className="omni-list">
                {section.items.map((item, i) => {
                  const idx = startIdx + i
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={cn('omni-list-row', activeIndex === idx && 'omni-list-row-active')}
                        onMouseEnter={() => onSelectIndex(idx)}
                        onClick={() => void pick(idx)}
                      >
                        <span className="omni-list-icon">
                          {item.icon ?? item.emoji ?? (item.kind === 'audio' ? '🔊' : '⚡')}
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-medium">{item.title}</span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-[var(--text-tertiary)]">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {item.duration != null && (
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      )}

      <div className="border-t border-[var(--bg-muted)] px-4 py-2">
        <button
          type="button"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-text)]"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowConnections(true)
          }}
        >
          Connections settings · Provider API keys
        </button>
      </div>
    </div>
  )
}
