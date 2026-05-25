import type { Editor } from '@tldraw/editor'
import { getSnapshot } from '@tldraw/editor'
import { debounce } from '@/lib/cn'
import type { ThemeConfig } from '@/themes'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/types/canvas'

export const WALL_FRAME_ID = 'shape:wall-frame' as const

export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4] as const

export const WALL_CAMERA = {
  wheelBehavior: 'pan' as const,
  panSpeed: 1,
  zoomSpeed: 1,
  zoomSteps: [...ZOOM_STEPS],
  constraints: {
    bounds: { x: -200, y: -200, w: 2000, h: 1400 },
    padding: { x: 48, y: 48 },
    origin: { x: 0.5, y: 0.5 },
    initialZoom: 'fit-max' as const,
    baseZoom: 'fit-max' as const,
    behavior: 'contain' as const,
  },
}

/** Public viewer — wall fills viewport, no pan/zoom */
export const PUBLIC_WALL_CAMERA = {
  isLocked: true,
  wheelBehavior: 'none' as const,
  panSpeed: 0,
  zoomSpeed: 0,
  zoomSteps: [1],
  constraints: {
    bounds: { x: 0, y: 0, w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
    padding: { x: 0, y: 0 },
    origin: { x: 0.5, y: 0.5 },
    initialZoom: 'fit-max' as const,
    baseZoom: 'fit-max' as const,
    behavior: 'contain' as const,
  },
}

export const WALL_TLDRAW_OPTIONS = {
  createTextOnCanvasDoubleClick: false,
  maxPages: 1,
  hitTestMargin: 8,
  adjacentShapeMargin: 12,
}

export const HIDDEN_TLDRAW_UI = {
  Toolbar: null,
  StylePanel: null,
  PageMenu: null,
  MainMenu: null,
  NavigationPanel: null,
  HelpMenu: null,
  DebugPanel: null,
  DebugMenu: null,
  ZoomMenu: null,
  Minimap: null,
  QuickActions: null,
  ActionsMenu: null,
  HelperButtons: null,
  SharePanel: null,
  TopPanel: null,
  MenuPanel: null,
  KeyboardShortcutsDialog: null,
  ContextMenu: null,
  ImageToolbar: null,
  VideoToolbar: null,
}

let editorRef: Editor | null = null
const zoomListeners = new Set<(z: number) => void>()
const historyListeners = new Set<() => void>()

export function registerWallEditor(editor: Editor | null) {
  editorRef = editor
}

export function getWallEditor() {
  return editorRef
}

export function onZoomChange(cb: (z: number) => void) {
  zoomListeners.add(cb)
  return () => {
    zoomListeners.delete(cb)
  }
}

export function notifyZoom(z: number) {
  zoomListeners.forEach((cb) => cb(z))
}

export function onHistoryChange(cb: () => void) {
  historyListeners.add(cb)
  return () => {
    historyListeners.delete(cb)
  }
}

export function notifyHistoryChange() {
  historyListeners.forEach((cb) => cb())
}

export function wallCenter(editor: Editor) {
  const cx = CANVAS_WIDTH / 2
  const cy = CANVAS_HEIGHT / 2
  const vp = editor.getViewportPageBounds()
  if (vp) {
    return { x: vp.x + vp.w / 2, y: vp.y + vp.h / 2 }
  }
  return { x: cx, y: cy }
}

function createWallFrame(editor: Editor, theme: ThemeConfig) {
  editor.createShape({
    id: WALL_FRAME_ID as never,
    type: 'geo',
    x: 0,
    y: 0,
    isLocked: true,
    opacity: 0,
    props: {
      geo: 'rectangle',
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      dash: 'draw',
      color: 'black',
      fill: 'none',
      size: 'm',
      font: 'draw',
      align: 'middle',
      verticalAlign: 'middle',
      growY: 0,
      url: '',
      scale: 1,
      richText: { type: 'doc', content: [] },
    },
    meta: { wallFrame: true, themeId: theme.id },
  })
  editor.sendToBack([WALL_FRAME_ID as never])
}

/** Updates the locked board frame colors when the user picks a new theme. */
export function applyWallTheme(editor: Editor, theme: ThemeConfig) {
  const existing = editor.getShape(WALL_FRAME_ID as never)
  if (!existing || existing.type !== 'geo') {
    createWallFrame(editor, theme)
    return
  }

  editor.updateShape({
    id: WALL_FRAME_ID as never,
    type: 'geo',
    opacity: 0,
    meta: { wallFrame: true, themeId: theme.id },
    props: {
      ...(existing.props as unknown as Record<string, unknown>),
      fill: 'none',
      color: 'black',
    },
  })
}

/** Zoom camera to the artboard bounds. */
export function zoomToWallPage(editor: Editor, opts?: { animate?: boolean }) {
  const bounds = editor.getShapePageBounds(WALL_FRAME_ID as never)
  if (bounds) {
    editor.zoomToBounds(bounds, {
      animation: opts?.animate === false ? { duration: 0 } : { duration: 300 },
      inset: 48,
    })
    return
  }
  editor.zoomToFit({ animation: { duration: 300 } })
}

export function setupWallSurface(
  editor: Editor,
  theme: ThemeConfig,
  mode: 'edit' | 'public' = 'edit',
  opts?: { skipZoom?: boolean },
) {
  const existing = editor.getShape(WALL_FRAME_ID as never)
  if (!existing) {
    createWallFrame(editor, theme)
  } else {
    applyWallTheme(editor, theme)
  }

  if (mode === 'public') {
    editor.setCameraOptions(PUBLIC_WALL_CAMERA)
    editor.zoomToFit({ animation: { duration: 0 } })
  } else {
    editor.setCameraOptions(WALL_CAMERA)
    if (!opts?.skipZoom) {
      zoomToWallPage(editor)
    }
  }
}

/** Debounced persist + history — avoids full-app re-render / CDN refetch storms on every transform frame. */
export function attachWallDocumentSync(
  editor: Editor,
  handlers: {
    readOnly: () => boolean
    onPersist: (snapshot: unknown) => void
  },
) {
  const schedulePersist = debounce(() => {
    if (handlers.readOnly()) return
    handlers.onPersist(getSnapshot(editor.store))
  }, 1200)

  const scheduleHistory = debounce(() => {
    if (!handlers.readOnly()) notifyHistoryChange()
  }, 200)

  const flushPersist = () => {
    if (handlers.readOnly()) return
    schedulePersist.cancel()
    handlers.onPersist(getSnapshot(editor.store))
  }

  const unsubStore = editor.store.listen(
    () => {
      schedulePersist()
      scheduleHistory()
    },
    { scope: 'document' },
  )

  const onPointerUp = () => flushPersist()
  window.addEventListener('pointerup', onPointerUp, { capture: true })

  return () => {
    unsubStore()
    window.removeEventListener('pointerup', onPointerUp, { capture: true })
    schedulePersist.cancel()
    scheduleHistory.cancel()
  }
}

export function fitPublicWall(editor: Editor) {
  editor.setCameraOptions(PUBLIC_WALL_CAMERA)
  zoomToWallPage(editor, { animate: false })
}

export function setWallReadonly(editor: Editor, readonly: boolean) {
  editor.updateInstanceState({ isReadonly: readonly })
}
