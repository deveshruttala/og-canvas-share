import { isApiConfigured } from '@/lib/api'
import { isLocalAuth } from '@/lib/auth/config'
import { loadCanvas, saveCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID, wallCanvasId } from '@/persist/constants'
import type { CanvasDoc } from '@/types/canvas'

export function canPublishWalls(): boolean {
  return isLocalAuth() || isApiConfigured()
}

/** Load a wall for public /u/:username when running in local (IndexedDB) mode. */
export async function loadPublishedWall(username: string): Promise<CanvasDoc | undefined> {
  const id = wallCanvasId(username)
  const doc = await loadCanvas(id)
  if (doc?.meta?.publishedAt) return doc

  if (username === 'local' || id === LOCAL_CANVAS_ID) {
    const legacy = await loadCanvas(LOCAL_CANVAS_ID)
    if (legacy?.meta?.publishedAt) return legacy
  }

  return undefined
}

/** Save the current editor doc as the user's published public wall (local mode). */
export async function publishWallLocally(username: string, doc: CanvasDoc): Promise<CanvasDoc> {
  const id = wallCanvasId(username)
  const now = new Date().toISOString()
  const published: CanvasDoc = {
    ...doc,
    id,
    meta: {
      ...doc.meta,
      updatedAt: now,
      publishedAt: now,
    },
  }
  await saveCanvas(published)
  return published
}

/** Persist draft + optional share version bump without requiring API. */
export async function saveWallDraftLocally(username: string, doc: CanvasDoc): Promise<void> {
  const id = wallCanvasId(username)
  await saveCanvas({
    ...doc,
    id,
    meta: { ...doc.meta, updatedAt: new Date().toISOString() },
  })
}
