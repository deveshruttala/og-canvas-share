import type { CanvasDoc } from '@/types/canvas'

export const DEMO_CANVAS_ID = 'demo'
export const LOCAL_CANVAS_ID = 'local'

/** Canvas id for a signed-in user — matches server wall key (`/u/:username`). */
export function wallCanvasId(username: string): string {
  return username.toLowerCase().trim()
}

export function shouldPersistDoc(doc: CanvasDoc): boolean {
  return doc.id !== DEMO_CANVAS_ID
}
