import { useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useOmniStore, flattenOmniItems, getOmniPlaceholders } from '@/store/omni.store'
import { modKeyLabel } from '@/lib/platform'
import { cn } from '@/lib/cn'
import { OmniResults } from '@/ui/OmniResults'
import { insertOmniItem } from '@/lib/omni-insert'

type Props = {
  variant?: 'floating' | 'inline'
}

export function OmniBar({ variant = 'floating' }: Props) {
  const open = useOmniStore((s) => s.open)
  const query = useOmniStore((s) => s.query)
  const setOpen = useOmniStore((s) => s.setOpen)
  const setQuery = useOmniStore((s) => s.setQuery)
  const placeholderIdx = useOmniStore((s) => s.placeholderIdx)
  const tickPlaceholder = useOmniStore((s) => s.tickPlaceholder)
  const sections = useOmniStore((s) => s.sections)
  const activeIndex = useOmniStore((s) => s.activeIndex)
  const setActiveIndex = useOmniStore((s) => s.setActiveIndex)
  const loading = useOmniStore((s) => s.loading)

  const placeholders = getOmniPlaceholders()
  const flat = useMemo(() => flattenOmniItems(sections), [sections])
  const inline = variant === 'inline'

  useEffect(() => {
    const id = window.setInterval(tickPlaceholder, 4000)
    return () => window.clearInterval(id)
  }, [tickPlaceholder])

  return (
    <div className={cn('omni-bar-root', inline && 'omni-bar-root-inline', open && 'omni-bar-root-open')}>
      <div className="omni-bar-shell">
        <Search className="omni-bar-icon h-4 w-4 shrink-0" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex(Math.min(activeIndex + 1, Math.max(0, flat.length - 1)))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex(Math.max(activeIndex - 1, 0))
            }
            if (e.key === 'Enter' && flat[activeIndex]) {
              e.preventDefault()
              void insertOmniItem(flat[activeIndex]).then(() => {
                setOpen(false)
                setQuery('')
              })
            }
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder={inline ? 'Search images, GIFs, widgets, links…' : placeholders[placeholderIdx]}
          className="omni-bar-input flex-1"
          aria-label="Universal search"
          aria-expanded={open}
        />
        <kbd className="omni-bar-kbd hidden lg:inline">{modKeyLabel()}K</kbd>
      </div>

      {open && (
        <OmniResults
          sections={sections}
          loading={loading}
          activeIndex={activeIndex}
          onSelectIndex={setActiveIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
