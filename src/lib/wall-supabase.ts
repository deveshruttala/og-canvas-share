/**
 * Supabase wall persistence — server-backed read/write so published walls are
 * visible across browsers and devices (unlike the IndexedDB-only local mode).
 *
 * Table contract (see server/supabase/schema.sql):
 *   walls (
 *     username     text primary key,
 *     owner_id     uuid references auth.users(id) on delete cascade,
 *     doc          jsonb not null,
 *     published_at timestamptz,
 *     updated_at   timestamptz default now()
 *   )
 *
 * Row-level security is enabled; the SQL file ships an RLS policy that lets
 * anyone READ published walls but only the owner WRITE their own row.
 */
import type { CanvasDoc } from '@/types/canvas'
import { getSupabaseClient } from '@/lib/supabase'

function lowerSlug(username: string): string {
  return username.toLowerCase().trim()
}

/** Load a published wall by username. Returns null if not published or not found. */
export async function loadWallFromSupabase(username: string): Promise<CanvasDoc | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const slug = lowerSlug(username)
  const { data, error } = await supabase
    .from('walls')
    .select('doc, published_at')
    .eq('username', slug)
    .not('published_at', 'is', null)
    .maybeSingle()
  if (error || !data?.doc) return null
  return data.doc as CanvasDoc
}

/** Upsert the current user's wall doc. Sets published_at if the doc has it. */
export async function saveWallToSupabase(
  username: string,
  doc: CanvasDoc,
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const slug = lowerSlug(username)
  const { data: userRes } = await supabase.auth.getUser()
  const ownerId = userRes.user?.id
  if (!ownerId) throw new Error('Sign in before saving')
  const { error } = await supabase.from('walls').upsert(
    {
      username: slug,
      owner_id: ownerId,
      doc,
      published_at: doc.meta?.publishedAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'username' },
  )
  if (error) throw new Error(error.message)
}
