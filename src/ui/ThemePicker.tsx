import { useEffect, useRef, useState } from 'react'
import { Check, ImageIcon, Palette, Sparkles, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCanvasStore } from '@/store/canvas.store'
import { THEME_CATEGORIES, getTheme, themeList, type ThemeId } from '@/themes'
import { loadCommunityThemes, type CommunityThemeJson } from '@/themes/community-theme'
import {
  normalizePageBackgroundInput,
  pageBackgroundFromFile,
  resolvePageBackgroundStyle,
} from '@/editor/wall-page-background'
import { loadAiConfig } from '@/lib/ai-config'
import { generateThemeWithAi } from '@/lib/ai-theme'
import { cn } from '@/lib/cn'

export function ThemePicker() {
  const themeId = useCanvasStore((s) => s.doc.theme)
  const customPageBackground = useCanvasStore((s) => s.doc.customPageBackground)
  const customPageBackgroundSize = useCanvasStore((s) => s.doc.customPageBackgroundSize)
  const setTheme = useCanvasStore((s) => s.setTheme)
  const setPageBackground = useCanvasStore((s) => s.setPageBackground)
  const applyCommunityTheme = useCanvasStore((s) => s.applyCommunityTheme)
  const [open, setOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [community, setCommunity] = useState<CommunityThemeJson[]>([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const current = getTheme(themeId)

  useEffect(() => {
    if (!open) return
    void loadCommunityThemes().then(setCommunity)
  }, [open])

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

  const applySolidColor = (hex: string) => {
    setPageBackground(hex, null)
    setCustomOpen(false)
    toast.success('Page color applied')
  }

  const clearCustom = () => {
    setPageBackground(null, null)
    toast.success('Custom background cleared')
  }

  const onUpload = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file (JPG, PNG, WebP…)')
      return
    }
    setUploading(true)
    try {
      const { background, size } = await pageBackgroundFromFile(file)
      setPageBackground(background, size)
      setCustomOpen(false)
      toast.success('Background image applied')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const applyCommunity = (t: CommunityThemeJson) => {
    applyCommunityTheme({
      id: t.id,
      workspaceBackground: t.workspaceBackground,
      pageBackground: t.pageBackground,
      pageBackgroundSize: t.pageBackgroundSize,
      defaultAccent: t.defaultAccent,
    })
    setOpen(false)
    toast.success(`Applied ${t.label}`)
  }

  const runAiTheme = async () => {
    const config = loadAiConfig()
    if (!config?.apiKey) {
      toast.error('Add an OpenAI key in Wall Agent settings first')
      return
    }
    setAiBusy(true)
    try {
      const theme = await generateThemeWithAi(aiPrompt || 'cozy dark developer wall', config)
      applyCommunity(theme)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Theme generation failed')
    } finally {
      setAiBusy(false)
    }
  }

  const pagePreviewStyle = resolvePageBackgroundStyle(
    customPageBackground,
    customPageBackgroundSize,
    current,
  )

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onUpload(e.target.files?.[0])}
      />

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
          className="wall-theme-panel absolute bottom-full left-0 mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl"
          role="listbox"
          aria-label="Page and workspace backgrounds"
        >
          <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Themes — page surface (1600×1000)
          </p>
          <p className="mb-2 px-1 text-[9px] text-neutral-600">
            Presets style the artboard; workspace stays themed around it. Built-ins + community in one gallery.
          </p>

          <div className="max-h-[min(20rem,55vh)] space-y-3 overflow-y-auto pr-0.5">
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

            {community.length > 0 && (
              <div>
                <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                  Community
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {community.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      onClick={() => applyCommunity(t)}
                      className="wall-theme-option flex flex-col items-start gap-1 rounded-xl border border-neutral-800 bg-neutral-900/80 p-2 text-left transition hover:border-neutral-600"
                    >
                      <span
                        className="block h-8 w-full rounded-md border border-white/10"
                        style={{ background: t.pageBackground, backgroundSize: t.pageBackgroundSize }}
                      />
                      <span className="text-[11px] font-bold leading-tight text-white">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-neutral-800 pt-3">
            <p className="mb-2 flex items-center gap-1 px-1 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
              <Sparkles className="h-3 w-3 text-[#beee1d]" />
              AI theme generator
            </p>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. warm espresso notebook with gold accent"
              className="mb-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white outline-none focus:border-[#beee1d]"
            />
            <button
              type="button"
              disabled={aiBusy}
              onClick={() => void runAiTheme()}
              className="w-full rounded-lg bg-[#beee1d]/90 py-2 text-xs font-bold text-black disabled:opacity-50"
            >
              {aiBusy ? 'Generating…' : 'Generate & apply'}
            </button>
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
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#beee1d]/40 bg-[#beee1d]/5 px-3 py-3 text-xs font-bold text-[#beee1d] hover:bg-[#beee1d]/10 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Processing…' : 'Upload image'}
                </button>
                <p className="text-[9px] text-neutral-600">
                  JPG, PNG, or WebP — saved in your wall (no URL needed).
                </p>

                {customPageBackground && (
                  <div
                    className="h-14 w-full rounded-lg border border-white/10"
                    style={resolvePageBackgroundStyle(
                      customPageBackground,
                      customPageBackgroundSize,
                      current,
                    )}
                  />
                )}

                <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                  Solid color
                </label>
                <input
                  type="color"
                  className="h-9 w-full cursor-pointer rounded-lg border border-neutral-700 bg-neutral-900"
                  onChange={(e) => applySolidColor(normalizePageBackgroundInput(e.target.value) ?? e.target.value)}
                  aria-label="Pick a solid page color"
                />

                {customPageBackground && (
                  <button
                    type="button"
                    onClick={clearCustom}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-neutral-700 px-2 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear custom background
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
