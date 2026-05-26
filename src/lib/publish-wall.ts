import { isApiConfigured } from '@/lib/api'
import { isLocalAuth, isSupabaseAuth } from '@/lib/auth/config'
import { isSupabaseConfigured } from '@/lib/supabase'
import { loadCanvas, saveCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID, publishedWallId, wallCanvasId } from '@/persist/constants'
import type { CanvasDoc } from '@/types/canvas'
import { loadWallFromSupabase, saveWallToSupabase } from '@/lib/wall-supabase'

export function canPublishWalls(): boolean {
  return isLocalAuth() || isApiConfigured() || (isSupabaseAuth() && isSupabaseConfigured())
}

/** Public URL slug — always lowercase to match /u/:username routes. */
export function publicWallSlug(username: string): string {
  return wallCanvasId(username)
}

/** Load a wall for public /u/:username — tries Supabase (if configured),
 *  then falls back to the local IndexedDB snapshot. */
export async function loadPublishedWall(username: string): Promise<CanvasDoc | undefined> {
  const slug = publicWallSlug(username)

  if (isSupabaseAuth() && isSupabaseConfigured()) {
    try {
      const remote = await loadWallFromSupabase(slug)
      if (remote) return { ...remote, id: slug }
    } catch {
      /* fall through to local */
    }
  }

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

/** Save the current doc to Supabase (server-side, cross-device). */
export async function publishWallToSupabase(
  username: string,
  doc: CanvasDoc,
): Promise<CanvasDoc> {
  const slug = publicWallSlug(username)
  const now = new Date().toISOString()
  const published: CanvasDoc = {
    ...doc,
    id: slug,
    meta: { ...doc.meta, updatedAt: now, publishedAt: now },
  }
  await saveWallToSupabase(slug, published)
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
