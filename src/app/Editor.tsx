/**
 * Editor route — dark neon workspace with tldraw, dock, command palette, AI.
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Share2, Sparkles, Undo2, Redo2, LayoutGrid } from 'lucide-react'
import { WallTldrawEditor } from '@/editor/WallTldrawEditor'
import { Dock } from '@/ui/Dock'
import { HelpOverlay } from '@/ui/HelpOverlay'
import { OmniBar } from '@/ui/OmniBar'
import { useCanvasStore } from '@/store/canvas.store'
import { useUiStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { loadCanvas } from '@/persist/db'
import { wallCanvasId } from '@/persist/constants'
import { createEmptyCanvas } from '@/types/canvas'
import { handleTldrawPaste } from '@/lib/paste-handler'
import { getWallEditor, onHistoryChange } from '@/editor/wall-editor-api'
import { wallActions } from '@/editor/wall-actions'
import { DrawBrushPanel } from '@/editor/DrawBrushPanel'
import { SessionTimeline } from '@/editor/SessionTimeline'
import { useOmniStore } from '@/store/omni.store'
import { trackOmniCursor } from '@/lib/omni-cursor'
import '@/styles/omni-bar.css'
import '@/styles/editor-chrome.css'
import toast from 'react-hot-toast'

const ShareModal = lazy(() => import('@/ui/ShareModal').then((m) => ({ default: m.ShareModal })))
const CommandPalette = lazy(() => import('@/ui/CommandPalette').then((m) => ({ default: m.CommandPalette })))
const AddPicker = lazy(() => import('@/ui/AddPicker').then((m) => ({ default: m.AddPicker })))
const GifPicker = lazy(() => import('@/ui/GifPicker').then((m) => ({ default: m.GifPicker })))
const EmojiPickerModal = lazy(() => import('@/ui/EmojiPickerModal').then((m) => ({ default: m.EmojiPickerModal })))
const IconPickerModal = lazy(() => import('@/ui/IconPickerModal').then((m) => ({ default: m.IconPickerModal })))
const AiAgentPanel = lazy(() => import('@/ui/AiAgentPanel').then((m) => ({ default: m.AiAgentPanel })))
const WidgetPicker = lazy(() => import('@/ui/WidgetPicker').then((m) => ({ default: m.WidgetPicker })))
const ConnectionsModal = lazy(() => import('@/ui/ConnectionsModal').then((m) => ({ default: m.ConnectionsModal })))

export function Editor() {
  const hydrate = useCanvasStore((s) => s.hydrate)
  const hydrated = useCanvasStore((s) => s.hydrated)
  const saveStatus = useCanvasStore((s) => s.saveStatus)
  const wallTitle = useCanvasStore((s) => s.doc.title)
  const setTitle = useCanvasStore((s) => s.setTitle)
  const persist = useCanvasStore((s) => s.persist)
  const setShowHelpOverlay = useUiStore((s) => s.setShowHelpOverlay)
  const setShowCommandPalette = useUiStore((s) => s.setShowCommandPalette)
  const setShowShareModal = useUiStore((s) => s.setShowShareModal)
  const setShowAiPanel = useUiStore((s) => s.setShowAiPanel)
  const showShareModal = useUiStore((s) => s.showShareModal)
  const showCommandPalette = useUiStore((s) => s.showCommandPalette)
  const showAddPicker = useUiStore((s) => s.showAddPicker)
  const showGifPicker = useUiStore((s) => s.showGifPicker)
  const showEmojiPicker = useUiStore((s) => s.showEmojiPicker)
  const showIconPicker = useUiStore((s) => s.showIconPicker)
  const showAiPanel = useUiStore((s) => s.showAiPanel)
  const showWidgetPicker = useUiStore((s) => s.showWidgetPicker)
  const showConnections = useUiStore((s) => s.showConnections)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const logout = useAuthStore((s) => s.logout)

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!user) return
    setCanvasReady(false)
    void (async () => {
      const wallId = wallCanvasId(user.username)
      const saved = await loadCanvas(wallId)
      if (saved) {
        hydrate(saved)
      } else {
        const doc = createEmptyCanvas(wallId)
        doc.title = `${user.username}'s Wall`
        hydrate(doc)
      }
      setCanvasReady(true)
    })()
  }, [user, hydrate])

  useEffect(() => {
    const refresh = () => {
      const u = wallActions.canUndo()
      const r = wallActions.canRedo()
      setCanUndo((prev) => (prev === u ? prev : u))
      setCanRedo((prev) => (prev === r ? prev : r))
    }
    refresh()
    return onHistoryChange(refresh)
  }, [hydrated])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if (!getWallEditor()) return
      e.preventDefault()
      void handleTldrawPaste(e)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'TEXTAREA' || tag === 'INPUT'

      if (mod && e.key === 'k') {
        e.preventDefault()
        useOmniStore.getState().setOpen(true)
      }
      if (mod && e.key === 's') {
        e.preventDefault()
        void persist()
      }
      if (mod && e.key === 'z' && !typing) {
        e.preventDefault()
        if (e.shiftKey) wallActions.redo()
        else wallActions.undo()
      }
      if (mod && e.key === '/') {
        e.preventDefault()
        setShowHelpOverlay(true)
      }
      if (e.key === 'Escape') {
        useUiStore.getState().setShowHelpOverlay(false)
        useUiStore.getState().setShowShareModal(false)
        useUiStore.getState().setShowCommandPalette(false)
        useUiStore.getState().setShowAiPanel(false)
        useUiStore.getState().setShowConnections(false)
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && !typing) {
        try {
          wallActions.deleteSelected()
        } catch {
          /* editor not ready */
        }
      }
      if (e.key === 'Home' && !typing) {
        e.preventDefault()
        wallActions.resetPan()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [persist, setShowHelpOverlay, setShowCommandPalette, setShowShareModal, setShowAiPanel])

  useEffect(() => {
    if (!hydrated) return
    const stop = trackOmniCursor()
    return stop
  }, [hydrated])

  if (!hydrated || !canvasReady || !user) {
    return (
      <div className="wall-editor-shell flex h-[100dvh] flex-col items-center justify-center gap-4 text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#beee1d]/30 border-t-[#beee1d]" />
        <p className="text-sm">Loading your wall…</p>
      </div>
    )
  }

  return (
    <div className="wall-editor-shell relative flex h-[100dvh] flex-col">
      <header className="wall-editor-header relative z-40 flex shrink-0 flex-col gap-3 px-4 py-3 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="wall-editor-title flex shrink-0 items-center gap-1.5 text-lg font-black">
              <span className="text-xl">🧱</span> WALL
            </Link>
            <span className="hidden text-white/15 sm:inline">|</span>
            <input
              type="text"
              value={wallTitle}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 max-w-[140px] truncate border-b border-transparent bg-transparent text-xs font-extrabold uppercase tracking-wider text-white outline-none transition hover:border-white/10 focus:border-[#beee1d] sm:max-w-[200px] sm:text-sm"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-0.5 rounded-full border border-white/5 bg-black/40 p-1 lg:flex">
            <button
              type="button"
              title="Undo"
              disabled={!canUndo}
              onClick={() => wallActions.undo()}
              className="rounded-full p-2 text-white transition hover:bg-white/5 disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Redo"
              disabled={!canRedo}
              onClick={() => wallActions.redo()}
              className="rounded-full p-2 text-white transition hover:bg-white/5 disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <span className="px-1 text-white/10">|</span>
            <button
              type="button"
              onClick={() => {
                wallActions.autoArrange()
                toast.success('Layout arranged!')
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#beee1d]/10 hover:text-[#beee1d]"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Auto-Arrange
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login')
                return
              }
              setShowAiPanel(true)
            }}
            className="wall-btn-ai hidden items-center gap-2 px-3 py-2 text-xs font-bold sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#beee1d]" />
            AI Copilot
          </button>

          <button type="button" onClick={() => setShowShareModal(true)} className="wall-btn-neon flex items-center gap-1.5 px-4 py-2 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>

          {user ? (
            <button type="button" onClick={logout} className="hidden text-xs text-neutral-500 hover:text-white sm:inline">
              Log out ({user.username})
            </button>
          ) : null}

          <span className="hidden text-[10px] text-neutral-600 lg:inline">
            {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
          </span>
        </div>
        </div>

        <OmniBar variant="inline" />
      </header>

      <div className="relative min-h-0 flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <WallTldrawEditor />
        <DrawBrushPanel />
        <SessionTimeline />
      </div>


      <Dock />
      <HelpOverlay />
      <Suspense fallback={null}>
        {showCommandPalette && <CommandPalette />}
        {showAddPicker && <AddPicker />}
        {showGifPicker && <GifPicker />}
        {showEmojiPicker && <EmojiPickerModal />}
        {showIconPicker && <IconPickerModal />}
        {showShareModal && <ShareModal />}
        {showAiPanel && <AiAgentPanel />}
        {showWidgetPicker && <WidgetPicker />}
        {showConnections && <ConnectionsModal />}
      </Suspense>
    </div>
  )
}
