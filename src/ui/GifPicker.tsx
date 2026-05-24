import { useEffect, useState } from 'react'
import { X, Search } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { wallActions } from '@/editor/wall-actions'

type GifResult = { id: string; url: string; title: string }

const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY ?? 'GlVGYHkr3WSBnllca54iNt0yFyLpWLah'

export function GifPicker() {
  const open = useUiStore((s) => s.showGifPicker)
  const setOpen = useUiStore((s) => s.setShowGifPicker)
  const addGifAt = (url: string) => wallActions.addGif(url)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    void fetchGifs(query || 'trending')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function fetchGifs(q: string) {
    setLoading(true)
    try {
      const endpoint =
        q === 'trending'
          ? `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=g`
          : `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=g`
      const res = await fetch(endpoint)
      const data = await res.json()
      setResults(
        (data.data ?? []).map(
          (g: { id: string; title: string; images: { fixed_height: { url: string } } }) => ({
            id: g.id,
            title: g.title,
            url: g.images.fixed_height.url,
          }),
        ),
      )
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--r-xl)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--bg-muted)] px-4 py-3">
          <h3 className="font-display text-lg text-[var(--text-primary)]">Add a GIF</h3>
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
            onKeyDown={(e) => e.key === 'Enter' && void fetchGifs(query || 'trending')}
            placeholder="Search Giphy…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void fetchGifs(query || 'trending')}
            className="rounded-[var(--r-pill)] bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white"
          >
            Search
          </button>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4">
          {loading && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--text-secondary)]">
              Loading…
            </p>
          )}
          {!loading &&
            results.map((gif) => (
              <button
                key={gif.id}
                type="button"
                className="aspect-square overflow-hidden rounded-[var(--r-md)] bg-[var(--bg-subtle)] hover:ring-2 hover:ring-[var(--accent)]"
                onClick={() => {
                  addGifAt(gif.url)
                  setOpen(false)
                }}
              >
                <img src={gif.url} alt={gif.title} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
