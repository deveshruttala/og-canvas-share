import { useEffect, useState } from 'react'
import { X, Search } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { wallActions } from '@/editor/wall-actions'
import { fetchGifPickerResults } from '@/providers/gifs'
import { cn } from '@/lib/cn'

const QUICK_TAGS = [
  'trending',
  'celebration',
  'reaction',
  'funny',
  'love',
  'wow',
  'dance',
  'cat',
  'dog',
  'work',
  'sports',
  'nature',
  'gaming',
  'anime',
  'meme',
  'happy',
  'sad',
  'thumbs up',
  'hello',
  'party',
  'coffee',
  'rain',
  'space',
  'art',
] as const

export function GifPicker() {
  const open = useUiStore((s) => s.showGifPicker)
  const setOpen = useUiStore((s) => s.setShowGifPicker)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof fetchGifPickerResults>>['items']
  >([])
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState<string | undefined>()
  const [source, setSource] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return
    void runSearch('trending')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function runSearch(q: string) {
    setLoading(true)
    setHint(undefined)
    try {
      const { items, error, source: src } = await fetchGifPickerResults(q)
      setResults(items)
      setHint(error)
      setSource(src)
    } catch {
      setResults([])
      setHint('GIF search failed — check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--r-xl)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--bg-muted)] px-4 py-3">
          <div>
            <h3 className="font-display text-lg text-[var(--text-primary)]">GIF Library</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">Giphy · Tenor · Openverse — up to 48 results</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 border-b border-[var(--bg-muted)] p-3">
          <Search className="h-5 w-5 shrink-0 text-[var(--text-tertiary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void runSearch(query.trim() || 'trending')}
            placeholder="Search GIFs (e.g. train, celebration, cat)…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void runSearch(query.trim() || 'trending')}
            className="rounded-[var(--r-pill)] bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white"
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-b border-[var(--bg-muted)] px-3 py-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                query === tag || (tag === 'trending' && !query.trim())
                  ? 'bg-[var(--accent)]/15 text-[var(--accent-text)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10',
              )}
              onClick={() => {
                setQuery(tag === 'trending' ? '' : tag)
                void runSearch(tag)
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        {source && (
          <p className="border-b border-[var(--bg-muted)] px-4 py-1.5 text-[10px] text-[var(--text-tertiary)]">
            Source: {source}
          </p>
        )}
        {hint && (
          <p className="border-b border-[var(--bg-muted)] px-4 py-2 text-xs text-amber-700">{hint}</p>
        )}
        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4 md:grid-cols-5">
          {loading && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--text-secondary)]">
              Loading…
            </p>
          )}
          {!loading && results.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--text-secondary)]">
              No GIFs found. Try another tag or add a Giphy API key in Connections.
            </p>
          )}
          {!loading &&
            results.map((gif) => (
              <button
                key={gif.id}
                type="button"
                className="aspect-square overflow-hidden rounded-[var(--r-md)] bg-[var(--bg-subtle)] hover:ring-2 hover:ring-[var(--accent)]"
                onClick={() => {
                  void wallActions.addGifAt(gif.url)
                  setOpen(false)
                }}
              >
                <img
                  src={gif.thumb}
                  alt={gif.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
