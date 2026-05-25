/**
 * Production dock — dark neon toolbar with tools, widgets, undo/redo, zoom.
 */
import { useEffect, useState } from 'react'
import {
  Type,
  Image,
  Code2,
  Pencil,
  Smile,
  QrCode,
  Undo2,
  Redo2,
  LayoutGrid,
  Share2,
  Minus,
  Plus,
  Maximize2,
} from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { ThemePicker } from '@/ui/ThemePicker'
import { wallActions } from '@/editor/wall-actions'
import { getWallEditor, onZoomChange, ZOOM_STEPS } from '@/editor/wall-editor-api'
import { useWallHistory } from '@/editor/useWallHistory'
import { blobToDataUrl, compressImage } from '@/lib/compress-image'
import toast from 'react-hot-toast'

function Divider() {
  return <span className="mx-1 h-8 w-px shrink-0 bg-neutral-800" />
}

export function Dock() {
  const activeTool = useUiStore((s) => s.activeTool)
  const setTool = useUiStore((s) => s.setTool)
  const zoomScale = useUiStore((s) => s.zoomScale)
  const setZoomScale = useUiStore((s) => s.setZoomScale)
  const setShowShareModal = useUiStore((s) => s.setShowShareModal)
  const setShowGifPicker = useUiStore((s) => s.setShowGifPicker)
  const setShowEmojiPicker = useUiStore((s) => s.setShowEmojiPicker)

  const [zoomOpen, setZoomOpen] = useState(false)
  const { canUndo, canRedo } = useWallHistory()

  useEffect(() => onZoomChange(setZoomScale), [setZoomScale])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if (!getWallEditor()) return
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        wallActions.zoomIn()
      }
      if (e.key === '-') {
        e.preventDefault()
        wallActions.zoomOut()
      }
      if (e.key === '0') {
        e.preventDefault()
        wallActions.resetZoom()
      }
      if (e.key === '1') {
        e.preventDefault()
        wallActions.fitWall()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const run = (fn: () => void, err = 'Editor not ready') => {
    try {
      fn()
    } catch {
      toast.error(err)
    }
  }

  const pickImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      run(() => void wallActions.addImageFromFile(file))
    }
    input.click()
  }

  const pickEmbed = () => {
    const url = window.prompt('Enter embed URL (YouTube, Spotify, etc.)')
    if (!url) return
    run(() => wallActions.addEmbed(url))
  }

  const pickQr = () => {
    const url = window.prompt('URL or text for QR code')
    if (!url) return
    run(() => void wallActions.addQr(url))
  }

  const startDraw = () => {
    setTool('drawing')
    run(() => wallActions.setDrawTool())
  }

  const autoArrange = () => {
    run(() => {
      wallActions.autoArrange()
      toast.success('Layout arranged!')
    })
  }

  return (
    <div className="wall-dock-layer pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
      <div className="wall-dock wall-dock-fade pointer-events-auto flex max-w-[min(960px,100%)] items-center gap-2 rounded-3xl p-3 font-mono">
        <div className="wall-dock-scroll flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Undo / Redo / Auto-arrange */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title="Undo"
            disabled={!canUndo}
            onClick={() => run(() => wallActions.undo())}
            className="rounded-full p-2.5 text-neutral-300 transition hover:bg-white/5 disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Redo"
            disabled={!canRedo}
            onClick={() => run(() => wallActions.redo())}
            className="rounded-full p-2.5 text-neutral-300 transition hover:bg-white/5 disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Auto-arrange"
            onClick={autoArrange}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-[#beee1d]/10 hover:text-[#beee1d]"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Arrange</span>
          </button>
        </div>

        <Divider />

        {/* Creation tools */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="wall-dock-btn"
            title="Text box"
            onClick={() => run(() => wallActions.addTextBox())}
          >
            <Type className="h-4 w-4" />
            <span className="hidden md:inline">Text</span>
          </button>
          <button type="button" className="wall-dock-btn" title="Image" onClick={pickImage}>
            <Image className="h-4 w-4" />
            <span className="hidden md:inline">Image</span>
          </button>
          <button type="button" className="wall-dock-btn" title="Embed" onClick={pickEmbed}>
            <Code2 className="h-4 w-4" />
            <span className="hidden md:inline">Embed</span>
          </button>
          <button
            type="button"
            className={`wall-dock-btn ${activeTool === 'drawing' ? 'active' : ''}`}
            title="Draw"
            onClick={startDraw}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden md:inline">Draw</span>
          </button>
          <button type="button" className="wall-dock-btn" title="Emoji" onClick={() => setShowEmojiPicker(true)}>
            <Smile className="h-4 w-4" />
            <span className="hidden md:inline">Emoji</span>
          </button>
          <button type="button" className="wall-dock-btn" title="GIF" onClick={() => setShowGifPicker(true)}>
            <span className="text-sm">🎬</span>
            <span className="hidden md:inline">GIF</span>
          </button>
          <button type="button" className="wall-dock-btn" title="QR code" onClick={pickQr}>
            <QrCode className="h-4 w-4" />
            <span className="hidden md:inline">QR</span>
          </button>
        </div>

        <Divider />

        {/* Widget pills */}
        <div className="flex shrink-0 items-center gap-1.5 px-1">
          <button type="button" className="wall-widget-pill" onClick={() => run(() => wallActions.addWidget('clock'))}>
            ⏱ Clock
          </button>
          <button
            type="button"
            className="wall-widget-pill"
            onClick={() => run(() => wallActions.addWidget('weather', { location: 'New York, NY' }))}
          >
            ☁ Weather
          </button>
          <button
            type="button"
            className="wall-widget-pill"
            onClick={() =>
              run(() => wallActions.addWidget('spotify', { label: 'Hyper-Focus Ambient Waves' }))
            }
          >
            🎵 Spotify
          </button>
          <button
            type="button"
            className="wall-widget-pill"
            onClick={() => run(() => wallActions.addWidget('github', { repo: 'user/repo' }))}
          >
            🐙 GitHub
          </button>
          <button type="button" className="wall-widget-pill" onClick={() => run(() => wallActions.addProgress())}>
            📈 Goal
          </button>
          <button type="button" className="wall-widget-pill" onClick={() => run(() => wallActions.addSoundPad())}>
            🔊 Synth
          </button>
          <button
            type="button"
            className="wall-widget-pill"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = async () => {
                const file = input.files?.[0]
                if (!file) return
                const blob = await compressImage(file)
                const src = await blobToDataUrl(blob)
                run(() => void wallActions.addPolaroid(src))
              }
              input.click()
            }}
          >
            📸 Polaroid
          </button>
        </div>
        </div>

        <Divider />

        {/* Theme + zoom + share — outside scroll so popovers are not clipped */}
        <div className="wall-dock-menus flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="wall-widget-pill hidden lg:inline-flex"
            onClick={() => useUiStore.getState().setShowWidgetPicker(true)}
          >
            📚 Library
          </button>
          <ThemePicker />

          <button type="button" title="Zoom out" onClick={() => wallActions.zoomOut()} className="rounded-full p-2 hover:bg-white/5">
            <Minus className="h-4 w-4 text-neutral-400" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setZoomOpen((o) => !o)}
              className="min-w-[3rem] rounded-full px-2 py-1.5 font-mono text-xs font-black text-[#beee1d]"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            {zoomOpen && (
              <div className="wall-dock-popover absolute bottom-full left-1/2 z-[1] mb-2 -translate-x-1/2 rounded-xl border border-neutral-800 bg-neutral-950 py-1 shadow-xl">
                {ZOOM_STEPS.map((z) => (
                  <button
                    key={z}
                    type="button"
                    className="block w-full px-4 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/5"
                    onClick={() => {
                      wallActions.zoomTo(z)
                      setZoomOpen(false)
                    }}
                  >
                    {Math.round(z * 100)}%
                  </button>
                ))}
                <button
                  type="button"
                  className="block w-full border-t border-neutral-800 px-4 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/5"
                  onClick={() => {
                    wallActions.fitWall()
                    setZoomOpen(false)
                  }}
                >
                  Fit
                </button>
              </div>
            )}
          </div>

          <button type="button" title="Zoom in" onClick={() => wallActions.zoomIn()} className="rounded-full p-2 hover:bg-white/5">
            <Plus className="h-4 w-4 text-neutral-400" />
          </button>
          <button type="button" title="Fit wall" onClick={() => wallActions.fitWall()} className="rounded-full p-2 hover:bg-white/5">
            <Maximize2 className="h-4 w-4 text-neutral-400" />
          </button>

          <button type="button" title="Share" onClick={() => setShowShareModal(true)} className="wall-btn-neon flex items-center gap-1.5 px-4 py-2 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
