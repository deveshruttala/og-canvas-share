/**
 * ⌘K command palette — search actions, widgets, themes, and canvas elements.
 */
import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { useCanvasStore } from '@/store/canvas.store'
import { wallActions } from '@/editor/wall-actions'
import { themes } from '@/themes'
import { modKeyLabel } from '@/lib/platform'
import toast from 'react-hot-toast'

type Command = {
  id: string
  name: string
  category: 'action' | 'widget' | 'theme' | 'element'
  run: () => void
}

export function CommandPalette() {
  const open = useUiStore((s) => s.showCommandPalette)
  const setOpen = useUiStore((s) => s.setShowCommandPalette)
  const setTheme = useCanvasStore((s) => s.setTheme)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)

  const baseCommands = useMemo((): Command[] => {
    const actions: Command[] = [
      {
        id: 'sticky-lime',
        name: 'Add Bright Lime Sticky',
        category: 'action',
        run: () => wallActions.addSticky('Double-click to edit', 'light-green'),
      },
      {
        id: 'sticky-dark',
        name: 'Add Modern Dark Sticky',
        category: 'action',
        run: () => wallActions.addSticky('Notes go here…', 'orange'),
      },
      {
        id: 'sticky-minimal',
        name: 'Add Obsidian Minimal Sticky',
        category: 'action',
        run: () => wallActions.addSticky('Quick note', 'light-violet'),
      },
      { id: 'emoji-star', name: 'Add Star Indicator Emoji', category: 'action', run: () => wallActions.addEmoji('⭐') },
      { id: 'emoji-rocket', name: 'Add Retro Rocket Emoji', category: 'action', run: () => wallActions.addEmoji('🚀') },
      { id: 'arrange', name: 'Auto-Arrange Layout', category: 'action', run: () => wallActions.autoArrange() },
      { id: 'undo', name: 'Undo', category: 'action', run: () => wallActions.undo() },
      { id: 'redo', name: 'Redo', category: 'action', run: () => wallActions.redo() },
      { id: 'fit', name: 'Fit Wall to Viewport', category: 'action', run: () => wallActions.fitWall() },
    ]

    const widgets: Command[] = [
      { id: 'w-clock', name: 'Add Clock Widget', category: 'widget', run: () => wallActions.addWidget('clock') },
      {
        id: 'w-weather',
        name: 'Add Weather Widget',
        category: 'widget',
        run: () => wallActions.addWidget('weather', { location: 'New York, NY' }),
      },
      {
        id: 'w-spotify',
        name: 'Add Spotify Vinyl Player',
        category: 'widget',
        run: () => wallActions.addWidget('spotify', { label: 'Hyper-Focus Ambient Waves' }),
      },
      {
        id: 'w-github',
        name: 'Add GitHub Contribution Widget',
        category: 'widget',
        run: () => wallActions.addWidget('github', { repo: 'user/repo' }),
      },
    ]

    const themeCmds: Command[] = Object.values(themes).map((t) => ({
      id: `theme-${t.id}`,
      name: `Theme: ${t.label}`,
      category: 'theme' as const,
      run: () => setTheme(t.id),
    }))

    const elements: Command[] = wallActions.listSearchItems().map((item) => ({
      id: `el-${item.id}`,
      name: `Go to: ${item.label}`,
      category: 'element' as const,
      run: () => wallActions.focusShape(item.id),
    }))

    return [...actions, ...widgets, ...themeCmds, ...elements]
  }, [open, setTheme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return baseCommands
    return baseCommands.filter((c) => c.name.toLowerCase().includes(q))
  }, [baseCommands, query])

  useEffect(() => {
    setActiveIdx(0)
  }, [query, open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActiveIdx(0)
    }
  }, [open])

  const runCommand = (cmd: Command) => {
    try {
      cmd.run()
      setOpen(false)
      if (cmd.category !== 'element') toast.success(cmd.name)
    } catch {
      toast.error('Editor not ready')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault()
      runCommand(filtered[activeIdx])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 p-4 pt-[12vh] backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-900 p-4">
          <Search className="h-4 w-4 text-[#beee1d]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search actions, commands, widgets, themes…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
          />
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-500">No matching results</p>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => runCommand(cmd)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition ${
                  idx === activeIdx ? 'bg-[#beee1d] text-black' : 'text-neutral-200 hover:bg-white/5'
                }`}
              >
                <span>{cmd.name}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                    idx === activeIdx ? 'bg-black/10 text-black/70' : 'bg-white/5 text-neutral-500'
                  }`}
                >
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-between border-t border-neutral-900 bg-black/30 p-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <span>Press ESC to exit</span>
          <span>{modKeyLabel()}K keyboard trigger</span>
        </div>
      </div>
    </div>
  )
}
