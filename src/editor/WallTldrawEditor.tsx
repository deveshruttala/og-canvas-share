import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Tldraw, type TLComponents } from 'tldraw'
import type { Editor } from '@tldraw/editor'
import 'tldraw/tldraw.css'
import '@/editor/tldraw-wall.css'
import { WallCustomOverlay } from '@/editor/WallCustomOverlay'
import { WallEditorInFront } from '@/editor/WallEditorInFront'
import { WallInspectorLayer } from '@/editor/WallInspectorLayer'
import { WallLinkHandler } from '@/editor/WallLinkHandler'
import { WallPageCanvas } from '@/editor/WallPageCanvas'
import { WallTextBackdrops } from '@/editor/WallTextBackdrops'
import { WallThemeBackground } from '@/editor/WallThemeBackground'
import {
  applyWallTheme,
  attachWallDocumentSync,
  fitPublicWall,
  getWallEditor,
  HIDDEN_TLDRAW_UI,
  notifyZoom,
  registerWallEditor,
  setWallReadonly,
  setupWallSurface,
  WALL_CAMERA,
  WALL_TLDRAW_OPTIONS,
} from '@/editor/wall-editor-api'
import { resetTimelineMarks } from '@/editor/wall-timeline-history'
import {
  fixInvisibleWallHosts,
  sanitizeWallShapeMetas,
  upgradeBrokenEmbeds,
  upgradeLegacyBookmarks,
} from '@/editor/wall-host-shape'
import { migrateLegacyElements } from '@/editor/wall-migrate'
import { useCanvasStore } from '@/store/canvas.store'
import { getTheme } from '@/themes'
import type { CanvasDoc } from '@/types/canvas'

type Props = {
  readOnly?: boolean
  className?: string
}

function WallTldrawEditorInner({ readOnly = false, className }: Props) {
  const syncSnapshot = useCanvasStore((s) => s.syncFromSnapshot)
  const themeId = useCanvasStore((s) => s.doc.theme)
  const migratedRef = useRef(false)
  const readOnlyRef = useRef(readOnly)
  readOnlyRef.current = readOnly

  const mountSnapshotRef = useRef<CanvasDoc['snapshot'] | undefined>(undefined)
  if (mountSnapshotRef.current === undefined) {
    mountSnapshotRef.current = useCanvasStore.getState().doc.snapshot
  }

  const components = useMemo(
    (): TLComponents => ({
      ...HIDDEN_TLDRAW_UI,
      Background: WallThemeBackground,
      OnTheCanvas: function WallOnCanvas() {
        return (
          <>
            <WallPageCanvas />
            <WallTextBackdrops />
          </>
        )
      },
      InFrontOfTheCanvas: function WallInFront() {
        return (
          <>
            <WallCustomOverlay readOnly={readOnlyRef.current} />
            {readOnlyRef.current && <WallLinkHandler enabled />}
            {!readOnlyRef.current && (
              <>
                <WallEditorInFront />
                <WallInspectorLayer />
              </>
            )}
          </>
        )
      },
    }),
    [],
  )

  const onMount = useCallback(
    (editor: Editor) => {
      registerWallEditor(editor)
      setWallReadonly(editor, readOnlyRef.current)
      const initialTheme = getTheme(useCanvasStore.getState().doc.theme)
      setupWallSurface(editor, initialTheme, readOnlyRef.current ? 'public' : 'edit')

      const { snapshot, elements } = useCanvasStore.getState().doc
      if (!snapshot && elements.length > 0 && !migratedRef.current) {
        migrateLegacyElements(editor, elements)
        migratedRef.current = true
      }

      sanitizeWallShapeMetas(editor)
      fixInvisibleWallHosts(editor)
      void upgradeLegacyBookmarks(editor)
      void upgradeBrokenEmbeds(editor)

      editor.setCurrentTool(readOnlyRef.current ? 'hand' : 'select')

      const unsubSync = attachWallDocumentSync(editor, {
        readOnly: () => readOnlyRef.current,
        onPersist: (snap) => syncSnapshot(snap as CanvasDoc['snapshot']),
      })

      const unsubCam = editor.sideEffects.registerAfterChangeHandler('camera', () => {
        if (!readOnlyRef.current) notifyZoom(editor.getZoomLevel())
      })

      if (!readOnlyRef.current) {
        notifyZoom(editor.getZoomLevel())
        resetTimelineMarks(editor)
      }

      let onResize: (() => void) | undefined
      if (readOnlyRef.current) {
        onResize = () => fitPublicWall(editor)
        window.addEventListener('resize', onResize)
        requestAnimationFrame(() => fitPublicWall(editor))
      }

      return () => {
        unsubSync()
        unsubCam()
        if (onResize) window.removeEventListener('resize', onResize)
        registerWallEditor(null)
      }
    },
    [syncSnapshot],
  )

  useEffect(() => {
    const editor = getWallEditor()
    if (editor) applyWallTheme(editor, getTheme(themeId))
  }, [themeId])

  useEffect(() => {
    const editor = getWallEditor()
    if (!editor) return
    if (readOnly) {
      fitPublicWall(editor)
    } else {
      editor.setCameraOptions(WALL_CAMERA)
    }
  }, [readOnly])

  return (
    <div
      className={`wall-tldraw-root relative h-full w-full ${readOnly ? 'wall-public-view' : ''} ${className ?? ''}`}
      data-wall-theme={themeId}
    >
      <Tldraw
        licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        colorScheme="light"
        components={components}
        options={WALL_TLDRAW_OPTIONS}
        snapshot={mountSnapshotRef.current as never}
        onMount={onMount}
      />
    </div>
  )
}

export const WallTldrawEditor = memo(WallTldrawEditorInner)
