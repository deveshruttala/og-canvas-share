/**
 * Editor route — dark neon workspace with tldraw, dock, command palette, AI.
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Share2, Sparkles } from 'lucide-react'
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
import { getWallEditor } from '@/editor/wall-editor-api'
import { wallActions } from '@/editor/wall-actions'
import {
  isCanvasTypingTarget,
  isEditingWallText,
  startWallTextEditing,
} from '@/editor/wall-text-editing'
import { DrawBrushPanel } from '@/editor/DrawBrushPanel'
import { SessionTimeline } from '@/editor/SessionTimeline'
import { useOmniStore } from '@/store/omni.store'
import { trackOmniCursor } from '@/lib/omni-cursor'
import '@/styles/omni-bar.css'
import '@/styles/editor-chrome.css'
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
      const typing = isCanvasTypingTarget(e.target)
      const editingText = isEditingWallText(getWallEditor())

      if (mod && e.key === 'k') {
        e.preventDefault()
        const omni = useOmniStore.getState()
        omni.setOpen(true)
        requestAnimationFrame(() => {
          document.querySelector<HTMLInputElement>('.omni-bar-input')?.focus()
        })
      }
      if (mod && e.key === 's') {
        e.preventDefault()
        void persist()
      }
      if (mod && e.key === 'z' && !typing && !editingText) {
        e.preventDefault()
        if (e.shiftKey) wallActions.redo()
        else wallActions.undo()
      }
      if (mod && e.key === '/') {
        e.preventDefault()
        setShowHelpOverlay(true)
      }
      if (e.key === 'Escape') {
        useOmniStore.getState().setOpen(false)
        useOmniStore.getState().setQuery('')
        useUiStore.getState().setShowHelpOverlay(false)
        useUiStore.getState().setShowShareModal(false)
        useUiStore.getState().setShowCommandPalette(false)
        useUiStore.getState().setShowAiPanel(false)
        useUiStore.getState().setShowConnections(false)
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && !typing && !editingText) {
        try {
          wallActions.deleteSelected()
        } catch {
          /* editor not ready */
        }
      }
      if (e.key === 'Enter' && !typing && !editingText && !mod) {
        const editor = getWallEditor()
        const only = editor?.getOnlySelectedShape()
        if (only && (only.type === 'text' || only.type === 'note') && editor?.canEditShape(only)) {
          e.preventDefault()
          startWallTextEditing(editor, only.id)
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
      <header className="wall-editor-header relative z-40 flex shrink-0 items-center gap-2 border-b border-white/5 px-3 py-2 sm:gap-3 sm:px-4 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/" className="wall-editor-title flex shrink-0 items-center gap-1.5 text-base font-black sm:text-lg">
            <span className="text-lg sm:text-xl">🧱</span>
            <span className="hidden sm:inline">WALL</span>
          </Link>
          <span className="hidden text-white/15 md:inline">|</span>
          <input
            type="text"
            value={wallTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="hidden min-w-0 max-w-[100px] truncate border-b border-transparent bg-transparent text-xs font-extrabold uppercase tracking-wider text-white outline-none transition hover:border-white/10 focus:border-[#beee1d] sm:block sm:max-w-[140px] md:max-w-[180px]"
          />
        </div>

        <div className="wall-search-row min-w-0 flex-1">
          <OmniBar variant="inline" />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login')
                return
              }
              setShowAiPanel(true)
            }}
            className="wall-btn-ai hidden items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold md:flex"
            title="AI Copilot"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#beee1d]" />
            <span className="hidden lg:inline">AI</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="wall-btn-neon flex items-center gap-1 px-3 py-1.5 text-xs sm:px-4 sm:py-2"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="hidden text-[10px] text-neutral-500 hover:text-white xl:inline"
            >
              Log out
            </button>
          ) : null}

          <span className="hidden text-[10px] text-neutral-600 2xl:inline">
            {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
          </span>
        </div>
      </header>

      <div className="wall-editor-stage relative min-h-0 flex-1">
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
