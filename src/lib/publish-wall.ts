import { isApiConfigured } from '@/lib/api'
import { isLocalAuth } from '@/lib/auth/config'
import { loadCanvas, saveCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID, publishedWallId, wallCanvasId } from '@/persist/constants'
import type { CanvasDoc } from '@/types/canvas'

export function canPublishWalls(): boolean {
  return isLocalAuth() || isApiConfigured()
}

/** Public URL slug — always lowercase to match /u/:username routes. */
export function publicWallSlug(username: string): string {
  return wallCanvasId(username)
}

/** Load a wall for public /u/:username when running in local (IndexedDB) mode. */
export async function loadPublishedWall(username: string): Promise<CanvasDoc | undefined> {
  const slug = publicWallSlug(username)

  const snapshot = await loadCanvas(publishedWallId(slug))
  if (snapshot) {
    return { ...snapshot, id: slug }
  }

  const draft = await loadCanvas(slug)
  if (draft?.meta?.publishedAt) {
    if (!(await loadCanvas(publishedWallId(slug)))) {
      await saveCanvas({ ...draft, id: publishedWallId(slug) })
    }
    return draft
  }

  if (slug === 'local' || slug === LOCAL_CANVAS_ID) {
    const legacy = await loadCanvas(LOCAL_CANVAS_ID)
    if (legacy?.meta?.publishedAt) return legacy
    const legacyPub = await loadCanvas(publishedWallId('local'))
    if (legacyPub) return { ...legacyPub, id: slug }
  }

  return undefined
}

/** Save the current editor doc as the user's published public wall (local mode). */
export async function publishWallLocally(username: string, doc: CanvasDoc): Promise<CanvasDoc> {
  const slug = publicWallSlug(username)
  const now = new Date().toISOString()
  const published: CanvasDoc = {
    ...doc,
    id: slug,
    meta: {
      ...doc.meta,
      updatedAt: now,
      publishedAt: now,
    },
  }

  await saveCanvas(published)
  await saveCanvas({ ...published, id: publishedWallId(slug) })

  return published
}

/** Persist draft + optional share version bump without requiring API. */
export async function saveWallDraftLocally(username: string, doc: CanvasDoc): Promise<void> {
  const slug = publicWallSlug(username)
  await saveCanvas({
    ...doc,
    id: slug,
    meta: { ...doc.meta, updatedAt: new Date().toISOString() },
  })
}

/** Refresh the public snapshot after publish (e.g. version bump). */
export async function syncPublishedSnapshot(username: string, doc: CanvasDoc): Promise<void> {
  if (!doc.meta.publishedAt) return
  const slug = publicWallSlug(username)
  await saveCanvas({ ...doc, id: publishedWallId(slug) })
}
