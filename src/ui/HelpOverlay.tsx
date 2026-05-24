/**
 * Keyboard shortcuts overlay — opened via toolbar or ⌘/ (Ctrl+/).
 */
import { X } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { modKeyLabel } from '@/lib/platform'

const SHORTCUTS = [
  ['Undo', `${modKeyLabel()}Z`],
  ['Redo', `${modKeyLabel()}⇧Z`],
  ['Save', `${modKeyLabel()}S`],
  ['Duplicate', `${modKeyLabel()}D`],
  ['Help', `${modKeyLabel()}/`],
  ['Delete', 'Delete / Backspace'],
  ['Deselect', 'Escape'],
  ['Snap to grid', 'Shift + drag'],
  ['Proportional resize', `${modKeyLabel()} + handle`],
  ['Context menu', 'Right-click element'],
]

export function HelpOverlay() {
  const open = useUiStore((s) => s.showHelpOverlay)
  const setOpen = useUiStore((s) => s.setShowHelpOverlay)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="w-full max-h-[85dvh] overflow-y-auto rounded-t-wall-lg border border-white/10 bg-neutral-900 shadow-wall-lg sm:max-w-md sm:rounded-wall-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-xl text-white sm:text-2xl">Keyboard shortcuts</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-1 p-4 sm:p-5">
          {SHORTCUTS.map(([label, keys]) => (
            <li
              key={label}
              className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 text-sm text-white/80 odd:bg-white/[0.03]"
            >
              <span>{label}</span>
              <kbd className="shrink-0 rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-white/65">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="border-t border-white/5 px-5 py-3 text-center text-xs text-white/35">
          Tap outside or press Escape to close
        </p>
      </div>
    </div>
  )
}
