import { getSnapshot } from '@tldraw/editor'
import { getWallEditor } from '@/editor/wall-editor-api'
import { useCanvasStore } from '@/store/canvas.store'
import type { CanvasDoc } from '@/types/canvas'

/** Flush live tldraw state into the store and IndexedDB before publish / version bump. */
export async function prepareDocForShare(): Promise<CanvasDoc> {
  const editor = getWallEditor()
  if (!editor) return useCanvasStore.getState().doc

  const snapshot = getSnapshot(editor.store)
  const now = new Date().toISOString()
  useCanvasStore.setState((s) => ({
    doc: {
      ...s.doc,
      snapshot,
      meta: { ...s.doc.meta, updatedAt: now },
    },
  }))
  await useCanvasStore.getState().persist()
  return useCanvasStore.getState().doc
}

export function resolveWallExportElement(): HTMLElement | null {
  const marked = document.querySelector('[data-wall-export]')
  if (marked instanceof HTMLElement) return marked
  const root = document.querySelector('.wall-tldraw-root')
  return root instanceof HTMLElement ? root : null
}
