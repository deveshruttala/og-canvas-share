import { useCallback, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
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
  const filter = useOmniStore((s) => s.filter)
  const placeholderIdx = useOmniStore((s) => s.placeholderIdx)
  const tickPlaceholder = useOmniStore((s) => s.tickPlaceholder)
  const sections = useOmniStore((s) => s.sections)
  const activeIndex = useOmniStore((s) => s.activeIndex)
  const setActiveIndex = useOmniStore((s) => s.setActiveIndex)
  const loading = useOmniStore((s) => s.loading)

  const placeholders = getOmniPlaceholders(filter)
  const flat = useMemo(() => flattenOmniItems(sections), [sections])
  const inline = variant === 'inline'
  const inputRef = useRef<HTMLInputElement>(null)

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [setOpen, setQuery, setActiveIndex])

  useEffect(() => {
    const id = window.setInterval(tickPlaceholder, 4000)
    return () => window.clearInterval(id)
  }, [tickPlaceholder])

  useEffect(() => {
    if (!inline) return
    document.body.classList.toggle('wall-omni-search-open', open)
    return () => document.body.classList.remove('wall-omni-search-open')
  }, [open, inline])

  useEffect(() => {
    if (!inline || !open) return
    const onDocPointer = (e: MouseEvent) => {
      const root = inputRef.current?.closest('.omni-bar-root')
      if (root && !root.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener('mousedown', onDocPointer)
    return () => document.removeEventListener('mousedown', onDocPointer)
  }, [open, inline, closeSearch])

  const resultsPanel = open ? (
    <OmniResults
      sections={sections}
      loading={loading}
      activeIndex={activeIndex}
      onSelectIndex={setActiveIndex}
      onClose={closeSearch}
    />
  ) : null

  return (
    <div className={cn('omni-bar-root', inline && 'omni-bar-root-inline', open && 'omni-bar-root-open')}>
      <div className="omni-bar-shell">
        <Search className="omni-bar-icon h-4 w-4 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.trim()) setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
          }}
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
              void insertOmniItem(flat[activeIndex]).then(() => closeSearch())
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              closeSearch()
            }
          }}
          placeholder={inline ? placeholders[0] : placeholders[placeholderIdx]}
          className="omni-bar-input flex-1"
          aria-label="Universal search"
          aria-expanded={open}
        />
        {open ? (
          <button
            type="button"
            className="omni-bar-close"
            aria-label="Close search"
            onClick={closeSearch}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="omni-bar-kbd hidden lg:inline">{modKeyLabel()}K</kbd>
        )}
      </div>

      {open && inline && resultsPanel}

      {open &&
        inline &&
        typeof document !== 'undefined' &&
        createPortal(
          <button
            type="button"
            className="omni-search-backdrop"
            aria-label="Close search"
            onClick={closeSearch}
          />,
          document.body,
        )}

      {open && !inline && resultsPanel}
    </div>
  )
}
