import { useMemo } from 'react'
import { Loader2, Plus, RefreshCw, Grid3x3, LayoutGrid, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { OmniSection } from '@/providers/types'
import { flattenOmniItems, useOmniStore } from '@/store/omni.store'
import {
  OMNI_SEARCH_FILTERS,
  OMNI_SECTION_HELP,
  getOmniQuickTags,
  type OmniSearchFilter,
  type OmniThumbCols,
} from '@/lib/omni-catalog'
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

  const groups = [
    { id: 'media', label: 'Media' },
    { id: 'create', label: 'Create' },
    { id: 'wall', label: 'Wall' },
  ] as const

  return (
    <div className="omni-board-filters">
      {groups.map((g) => {
        const chips = OMNI_SEARCH_FILTERS.filter((f) => f.group === g.id)
        if (!chips.length) return null
        return (
          <div key={g.id} className="omni-filter-group">
            <span className="omni-filter-group-label">{g.label}</span>
            <div className="omni-filter-row" role="tablist" aria-label={`${g.label} categories`}>
              {chips.map((f) => (
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
                  <span aria-hidden>{f.emoji}</span>
                  <span className="omni-filter-chip-text">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OmniQuickTags({ filter }: { filter: OmniSearchFilter }) {
  const setQuery = useOmniStore((s) => s.setQuery)
  const setOpen = useOmniStore((s) => s.setOpen)
  const tags = getOmniQuickTags(filter)

  if (!tags.length) return null

  return (
    <div className="omni-quick-tags">
      <span className="omni-quick-tags-label">Quick picks</span>
      <div className="omni-quick-tags-row">
        {tags.map((tag) => (
          <button
            key={tag.label}
            type="button"
            className="omni-quick-tag"
            onClick={() => {
              setQuery(tag.query)
              setOpen(true)
            }}
          >
            {tag.emoji && <span aria-hidden>{tag.emoji}</span>}
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function OmniBoardToolbar({
  resultCount,
  loading,
  query,
}: {
  resultCount: number
  loading: boolean
  query: string
}) {
  const filter = useOmniStore((s) => s.filter)
  const thumbCols = useOmniStore((s) => s.thumbCols)
  const setThumbCols = useOmniStore((s) => s.setThumbCols)
  const refresh = useOmniStore((s) => s.refresh)
  const loadMore = useOmniStore((s) => s.loadMore)
  const loadingMore = useOmniStore((s) => s.loadingMore)
  const recentQueries = useOmniStore((s) => s.recentQueries)
  const setQuery = useOmniStore((s) => s.setQuery)
  const clearRecent = useOmniStore((s) => s.clearRecent)

  const filterMeta = OMNI_SEARCH_FILTERS.find((f) => f.id === filter)
  // "More" is only meaningful for paginated providers (images, gifs).
  // For other filters it falls back to "Refresh" so the button still has a job.
  const supportsMore =
    Boolean(query.trim()) && (filter === 'all' || filter === 'images' || filter === 'gifs')

  return (
    <div className="omni-board-toolbar">
      <div className="omni-board-toolbar-left">
        <SlidersHorizontal className="h-3.5 w-3.5 text-white/30" aria-hidden />
        <span className="omni-board-status">
          {loading ? (
            'Searching…'
          ) : query.trim() ? (
            <>
              <strong>{resultCount}</strong> results · {filterMeta?.emoji} {filterMeta?.label}
            </>
          ) : (
            <>
              Browse <strong>{filterMeta?.label ?? filter}</strong> — pick a quick tag or type below
            </>
          )}
        </span>
      </div>
      <div className="omni-board-toolbar-right">
        {(filter === 'images' || filter === 'gifs' || filter === 'all') && (
          <div className="omni-grid-size" role="group" aria-label="Thumbnail grid size">
            {([4, 5, 6] as OmniThumbCols[]).map((n) => (
              <button
                key={n}
                type="button"
                title={`${n} columns`}
                className={cn('omni-grid-size-btn', thumbCols === n && 'omni-grid-size-btn-active')}
                onClick={() => setThumbCols(n)}
              >
                {n === 4 ? <Grid3x3 className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
                <span>{n}</span>
              </button>
            ))}
          </div>
        )}
        {supportsMore ? (
          <button
            type="button"
            className="omni-toolbar-more"
            title="Load more results for this query"
            disabled={loading || loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <span>{loadingMore ? 'Loading…' : 'More'}</span>
          </button>
        ) : null}
        <button
          type="button"
          className="omni-toolbar-btn"
          title="Refresh (shuffle / re-fetch)"
          disabled={loading}
          onClick={() => void refresh()}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>
      {!query.trim() && recentQueries.length > 0 && (
        <div className="omni-recent-row">
          <span className="omni-recent-label">Recent</span>
          {recentQueries.map((r) => (
            <button key={r} type="button" className="omni-recent-chip" onClick={() => setQuery(r)}>
              {r}
            </button>
          ))}
          <button type="button" className="omni-recent-clear" onClick={clearRecent}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

function OmniEmptyState({ filter, query, onClose }: { filter: OmniSearchFilter; query: string; onClose: () => void }) {
  const setQuery = useOmniStore((s) => s.setQuery)
  const suggestions = getOmniQuickTags(filter).slice(0, 4)

  return (
    <div className="omni-empty-state">
      <p className="omni-empty-title">
        {query.trim()
          ? `No results for “${query.trim()}”`
          : filter === 'all'
            ? 'Choose a category or try a quick pick'
            : `Search ${filter} or browse with quick picks`}
      </p>
      <p className="omni-empty-hint">
        {filter === 'images'
          ? 'Openverse finds real stock photos with no key. Add Pixabay or Pexels in Connections for even more. Museum art only for painting-style queries.'
          : filter === 'all'
            ? 'Use Media for photos & GIFs, Create for text & stickers, Wall for widgets & themes.'
            : 'Tap a quick pick below, or switch category tabs above.'}
      </p>
      <div className="omni-empty-actions">
        {suggestions.map((tag) => (
          <button
            key={tag.label}
            type="button"
            className="omni-quick-tag"
            onClick={() => setQuery(tag.query)}
          >
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>
      <div className="omni-empty-links">
        <button
          type="button"
          className="omni-empty-link"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowWidgetPicker(true)
          }}
        >
          Widget library ({WIDGET_CATALOG.length}) →
        </button>
        <button
          type="button"
          className="omni-empty-link omni-empty-link-muted"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowConnections(true)
          }}
        >
          Connections & API keys →
        </button>
      </div>
    </div>
  )
}

export function OmniResults({ sections, loading, activeIndex, onSelectIndex, onClose }: Props) {
  const filter = useOmniStore((s) => s.filter)
  const query = useOmniStore((s) => s.query)
  const thumbCols = useOmniStore((s) => s.thumbCols)
  const pushRecentQuery = useOmniStore((s) => s.pushRecentQuery)
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

  const resultCount = flat.length
  const hasContent = sections.some((s) => s.items.length > 0 || s.error)

  const pick = async (idx: number) => {
    const item = flat[idx]
    if (!item) return
    if (query.trim()) pushRecentQuery(query)
    await insertOmniItem(item)
    onClose()
    useOmniStore.getState().setQuery('')
    useOmniStore.getState().setOpen(false)
  }

  const thumbGridClass = cn(
    'omni-thumb-grid',
    thumbCols === 4 && 'omni-thumb-grid-cols-4',
    thumbCols === 5 && 'omni-thumb-grid-cols-5',
    thumbCols === 6 && 'omni-thumb-grid-cols-6',
  )

  if (!hasContent && !loading) {
    return (
      <div className="omni-results-panel omni-results-panel-board">
        <div className="omni-filter-row-panel">
          <OmniFilterTabs />
        </div>
        <OmniQuickTags filter={filter} />
        <OmniBoardToolbar resultCount={0} loading={false} query={query} />
        <OmniEmptyState filter={filter} query={query} onClose={onClose} />
      </div>
    )
  }

  return (
    <div className="omni-results-panel omni-results-panel-board">
      <div className="omni-filter-row-panel">
        <OmniFilterTabs />
      </div>
      <OmniQuickTags filter={filter} />
      <OmniBoardToolbar resultCount={resultCount} loading={loading} query={query} />

      {sections.map((section, sectionIndex) => {
        const startIdx = sectionStarts[sectionIndex] ?? 0
        const showSection = section.items.length > 0 || section.error
        if (!showSection) return null

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

            {section.items.length === 0 ? null : section.id === 'images' ||
              section.id === 'gifs' ||
              section.id === 'videos' ? (
              <div className={thumbGridClass}>
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
                      {item.thumb || item.previewUrl ? (
                        <OmniThumb
                          src={item.thumb ?? item.previewUrl ?? ''}
                          fallback={item.thumb ? item.previewUrl : undefined}
                          alt={item.title}
                        />
                      ) : null}
                      <span className="omni-thumb-add">
                        <Plus className="h-3 w-3" />
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : section.id === 'emojis' || section.id === 'icons' || section.id === 'stickers' ? (
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
                      {item.thumb?.startsWith('http') ? (
                        <img
                          src={item.thumb}
                          alt=""
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        item.emoji ?? item.icon
                      )}
                    </button>
                  )
                })}
              </div>
            ) : section.id === 'themes' ? (
              <div className="omni-theme-grid">
                {section.items.map((item, i) => {
                  const idx = startIdx + i
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn('omni-theme-card', activeIndex === idx && 'omni-list-row-active')}
                      onMouseEnter={() => onSelectIndex(idx)}
                      onClick={() => void pick(idx)}
                    >
                      <span className="omni-theme-card-icon">{item.icon ?? '🎨'}</span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        {item.subtitle && (
                          <span className="block truncate text-[10px] text-white/40">{item.subtitle}</span>
                        )}
                      </span>
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
                            {Math.floor(item.duration / 60)}:
                            {String(item.duration % 60).padStart(2, '0')}
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
        <div className="omni-loading-row">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching providers…
        </div>
      )}

      <div className="omni-board-footer">
        <button
          type="button"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-text)]"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowConnections(true)
          }}
        >
          Connections · API keys
        </button>
        <button
          type="button"
          className="text-xs text-[#beee1d] hover:underline"
          onClick={() => {
            onClose()
            useUiStore.getState().setShowWidgetPicker(true)
          }}
        >
          Full widget library →
        </button>
      </div>
    </div>
  )
}
