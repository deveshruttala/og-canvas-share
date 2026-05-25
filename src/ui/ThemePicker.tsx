import { useEffect, useRef, useState } from 'react'
import { Check, ImageIcon, Palette, X } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas.store'
import { THEME_CATEGORIES, getTheme, themeList, type ThemeId } from '@/themes'
import { normalizePageBackgroundInput } from '@/editor/wall-page-background'
import { cn } from '@/lib/cn'

export function ThemePicker() {
  const themeId = useCanvasStore((s) => s.doc.theme)
  const customPageBackground = useCanvasStore((s) => s.doc.customPageBackground)
  const setTheme = useCanvasStore((s) => s.setTheme)
  const setPageBackground = useCanvasStore((s) => s.setPageBackground)
  const [open, setOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState(customPageBackground ?? '')
  const rootRef = useRef<HTMLDivElement>(null)
  const current = getTheme(themeId)

  useEffect(() => {
    setCustomDraft(customPageBackground ?? '')
  }, [customPageBackground])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id: ThemeId) => {
    setTheme(id)
    setOpen(false)
  }

  const applyCustom = () => {
    setPageBackground(normalizePageBackgroundInput(customDraft))
    setCustomOpen(false)
  }

  const clearCustom = () => {
    setCustomDraft('')
    setPageBackground(null)
  }

  const pagePreviewStyle = customPageBackground?.trim()
    ? { background: customPageBackground }
    : {
        background: current.pageBackground,
        backgroundSize: current.pageBackgroundSize,
      }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="wall-theme-trigger flex max-w-[11rem] items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-bold text-white outline-none hover:bg-neutral-800"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Canvas page background"
      >
        <span
          className="h-5 w-5 shrink-0 rounded-md border border-white/10 shadow-inner"
          style={pagePreviewStyle}
          aria-hidden
        />
        <span className="truncate">{customPageBackground ? 'Custom page' : current.label}</span>
        <Palette className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-500" />
      </button>

      {open && (
        <div
          className="wall-theme-panel absolute bottom-full left-0 z-[70] mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl"
          role="listbox"
          aria-label="Page and workspace backgrounds"
        >
          <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Page surface (1600×1000)
          </p>
          <p className="mb-2 px-1 text-[9px] text-neutral-600">
            Presets style the artboard; workspace stays themed around it.
          </p>

          <div className="max-h-[min(16rem,45vh)] space-y-3 overflow-y-auto pr-0.5">
            {THEME_CATEGORIES.map((cat) => {
              const items = themeList.filter((t) => t.category === cat.id)
              if (items.length === 0) return null
              return (
                <div key={cat.id}>
                  <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {items.map((t) => {
                      const theme = getTheme(t.id)
                      const active = !customPageBackground && t.id === themeId
                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => pick(t.id)}
                          className={cn(
                            'wall-theme-option flex flex-col items-start gap-1 rounded-xl border p-2 text-left transition',
                            active
                              ? 'border-[#beee1d]/60 bg-[#beee1d]/10'
                              : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-600',
                          )}
                        >
                          <span
                            className="relative h-8 w-full rounded-md border border-white/10"
                            style={{
                              background: theme.pageBackground,
                              backgroundSize: theme.pageBackgroundSize,
                            }}
                          >
                            {active && (
                              <Check className="absolute right-1 top-1 h-3 w-3 text-[#beee1d]" aria-hidden />
                            )}
                          </span>
                          <span className="text-[11px] font-bold leading-tight text-white">{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 border-t border-neutral-800 pt-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left text-[10px] font-bold uppercase tracking-widest text-neutral-500"
              onClick={() => setCustomOpen((o) => !o)}
            >
              <span className="flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" />
                Custom page background
              </span>
              <span className="text-neutral-600">{customOpen ? '−' : '+'}</span>
            </button>

            {customOpen && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  placeholder="#hex, linear-gradient(...), or image URL"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white outline-none focus:border-[#beee1d]"
                />
                <input
                  type="color"
                  className="h-9 w-full cursor-pointer rounded-lg border border-neutral-700 bg-neutral-900"
                  onChange={(e) => setCustomDraft(e.target.value)}
                  aria-label="Pick a solid page color"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyCustom}
                    className="flex-1 rounded-lg bg-[#beee1d] px-3 py-1.5 text-xs font-bold text-black"
                  >
                    Apply
                  </button>
                  {customPageBackground && (
                    <button
                      type="button"
                      onClick={clearCustom}
                      className="rounded-lg border border-neutral-700 px-2 py-1.5 text-neutral-400 hover:text-white"
                      title="Clear custom background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
