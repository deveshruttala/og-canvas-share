import { useEffect, useState } from 'react'
import { X, Search } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { wallActions } from '@/editor/wall-actions'

const ICONS = ['⭐', '🔗', '🎵', '📷', '💻', '🎨', '🚀', '☕', '🐙', '📌', '✨', '❤️']

export function IconPickerModal() {
  const open = useUiStore((s) => s.showIconPicker)
  const setOpen = useUiStore((s) => s.setShowIconPicker)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open) return null

  const filtered = ICONS.filter((i) => !query || i.includes(query))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[var(--r-xl)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-lg)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Add icon</h3>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-[var(--bg-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-3 flex gap-2">
          <Search className="h-5 w-5 text-[var(--text-tertiary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {filtered.map((icon) => (
            <button
              key={icon}
              type="button"
              className="flex h-12 items-center justify-center rounded-[var(--r-md)] text-2xl hover:bg-[var(--accent-soft)]"
              onClick={() => {
                wallActions.addIcon(icon)
                setOpen(false)
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
