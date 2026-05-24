import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Tldraw, type TLComponents } from 'tldraw'
import { getSnapshot, type Editor } from '@tldraw/editor'
import 'tldraw/tldraw.css'
import '@/editor/tldraw-wall.css'
import { WallCustomOverlay } from '@/editor/WallCustomOverlay'
import { WallEditorInFront } from '@/editor/WallEditorInFront'
import { WallLinkHandler } from '@/editor/WallLinkHandler'
import {
  fitPublicWall,
  getWallEditor,
  HIDDEN_TLDRAW_UI,
  notifyZoom,
  notifyHistoryChange,
  registerWallEditor,
  setWallReadonly,
  setupWallSurface,
  WALL_TLDRAW_OPTIONS,
} from '@/editor/wall-editor-api'
import { migrateLegacyElements } from '@/editor/wall-migrate'
import { useCanvasStore } from '@/store/canvas.store'
import { getTheme } from '@/themes'
import { debounce } from '@/lib/cn'
import type { CanvasDoc } from '@/types/canvas'

type Props = {
  readOnly?: boolean
  className?: string
}

function WallBackground() {
  return <div className="wall-workspace-bg pointer-events-none absolute inset-0" aria-hidden />
}

export function WallTldrawEditor({ readOnly = false, className }: Props) {
  const doc = useCanvasStore((s) => s.doc)
  const syncSnapshot = useCanvasStore((s) => s.syncFromSnapshot)
  const theme = getTheme(doc.theme)
  const migratedRef = useRef(false)
  const readOnlyRef = useRef(readOnly)
  readOnlyRef.current = readOnly

  const components = useMemo((): TLComponents => {
    const InFront = () => (
      <>
        <WallCustomOverlay readOnly={readOnlyRef.current} />
        {readOnlyRef.current && <WallLinkHandler enabled />}
        {!readOnlyRef.current && <WallEditorInFront />}
      </>
    )
    return {
      ...HIDDEN_TLDRAW_UI,
      Background: WallBackground,
      InFrontOfTheCanvas: InFront,
    }
  }, [])

  const debouncedSync = useMemo(
    () =>
      debounce((editor: Editor) => {
        const snap = getSnapshot(editor.store)
        syncSnapshot(snap as unknown as CanvasDoc['snapshot'])
      }, 400),
    [syncSnapshot],
  )

  const onMount = useCallback(
    (editor: Editor) => {
      registerWallEditor(editor)
      setWallReadonly(editor, readOnlyRef.current)
      setupWallSurface(editor, theme.background, readOnlyRef.current ? 'public' : 'edit')

      if (!doc.snapshot && doc.elements.length > 0 && !migratedRef.current) {
        migrateLegacyElements(editor, doc.elements)
        migratedRef.current = true
      }

      editor.setCurrentTool(readOnlyRef.current ? 'hand' : 'select')

      const unsubDoc = editor.store.listen(
        () => {
          if (!readOnlyRef.current) {
            debouncedSync(editor)
            notifyHistoryChange()
          }
        },
        { scope: 'document' },
      )

      const unsubCam = editor.sideEffects.registerAfterChangeHandler('camera', () => {
        if (!readOnlyRef.current) notifyZoom(editor.getZoomLevel())
      })

      if (!readOnlyRef.current) notifyZoom(editor.getZoomLevel())

      let onResize: (() => void) | undefined
      if (readOnlyRef.current) {
        onResize = () => fitPublicWall(editor)
        window.addEventListener('resize', onResize)
        requestAnimationFrame(() => fitPublicWall(editor))
      }

      return () => {
        unsubDoc()
        unsubCam()
        if (onResize) window.removeEventListener('resize', onResize)
        registerWallEditor(null)
      }
    },
    [debouncedSync, doc.elements, doc.snapshot, theme.background],
  )

  const initialSnapshot = doc.snapshot as never | undefined

  useEffect(() => {
    const editor = getWallEditor()
    if (editor) {
      setupWallSurface(editor, theme.background, readOnly ? 'public' : 'edit')
      if (readOnly) fitPublicWall(editor)
    }
  }, [theme.background, readOnly])

  return (
    <div className={`wall-tldraw-root relative h-full w-full ${readOnly ? 'wall-public-view' : ''} ${className ?? ''}`}>
      <Tldraw
        licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        colorScheme="light"
        components={components}
        options={WALL_TLDRAW_OPTIONS}
        snapshot={initialSnapshot}
        onMount={onMount}
      />
    </div>
  )
}
