/**
 * Track last canvas pointer position for OmniBar inserts.
 */
import { getWallEditor, wallCenter } from '@/editor/wall-editor-api'

let lastPagePoint: { x: number; y: number } | null = null

export function setLastCursorPage(pt: { x: number; y: number }) {
  lastPagePoint = pt
}

export function getInsertPoint(): { x: number; y: number } {
  if (lastPagePoint) return lastPagePoint
  const editor = getWallEditor()
  if (editor) return wallCenter(editor)
  return { x: 800, y: 500 }
}

export function trackOmniCursor() {
  const editor = getWallEditor()
  if (!editor) return () => {}

  const handler = () => {
    const pt = editor.inputs.currentPagePoint
    if (pt) setLastCursorPage({ x: pt.x, y: pt.y })
  }

  const interval = window.setInterval(handler, 200)
  return () => window.clearInterval(interval)
}
