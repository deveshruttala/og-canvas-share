import type { CanvasDoc } from '@/types/canvas'

export const DEMO_CANVAS_ID = 'demo'
export const LOCAL_CANVAS_ID = 'local'

export function shouldPersistDoc(doc: CanvasDoc): boolean {
  return doc.id !== DEMO_CANVAS_ID
}
