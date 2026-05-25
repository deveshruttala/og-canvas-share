import type { ProviderResult } from '@/providers/types'
import { getProviderKey } from '@/lib/provider-config'
import type { OmniItem } from '@/providers/types'

/** Always same-origin — proxied in dev (Vite) and Docker (nginx). */
const OPENVERSE_BASE = '/openverse-api/v1/images/'

function dedupeItems(items: OmniItem[]): OmniItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.thumb ?? item.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function searchUnsplash(q: string, key?: string) {
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=8&client_id=${key}`,
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map(
      (p: { id: string; urls: { small: string; regular: string }; alt_description?: string; user: { name: string } }) => ({
        id: `unsplash-${p.id}`,
        kind: 'image' as const,
        title: p.alt_description ?? 'Photo',
        thumb: p.urls.small,
        previewUrl: p.urls.regular,
        source: 'Unsplash',
        attribution: p.user.name,
        payload: { url: p.urls.regular, attribution: p.user.name },
      }),
    )
  } catch {
    return []
  }
}

async function searchPexels(q: string, key?: string) {
  if (!key) return []
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=8`, {
      headers: { Authorization: key },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.photos ?? []).map(
      (p: { id: number; src: { medium: string; large: string }; alt?: string; photographer: string }) => ({
        id: `pexels-${p.id}`,
        kind: 'image' as const,
        title: p.alt ?? 'Photo',
        thumb: p.src.medium,
        previewUrl: p.src.large,
        source: 'Pexels',
        attribution: p.photographer,
        payload: { url: p.src.large, attribution: p.photographer },
      }),
    )
  } catch {
    return []
  }
}

type OpenverseImage = {
  id: string
  title?: string
  url?: string
  thumbnail?: string
  thumbnail_url?: string
  creator?: string
  creator_url?: string
}

function openverseThumb(r: OpenverseImage): string | undefined {
  return r.thumbnail ?? r.thumbnail_url ?? r.url
}

/** Free CC image search — no API key (Openverse / Creative Commons). */
async function searchOpenverse(q: string): Promise<OmniItem[]> {
  try {
    const url = `${OPENVERSE_BASE}?q=${encodeURIComponent(q)}&page_size=24`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn('[images] Openverse search failed', res.status, await res.text().catch(() => ''))
      return []
    }
    const data = (await res.json()) as { results?: OpenverseImage[] }
    const items: OmniItem[] = []
    for (const r of data.results ?? []) {
      const imageUrl = r.url?.trim()
      const thumb = openverseThumb(r)
      if (!imageUrl || !thumb) continue
      items.push({
        id: `openverse-${r.id}`,
        kind: 'image',
        title: r.title?.trim() || q,
        thumb,
        previewUrl: imageUrl,
        source: 'Openverse',
        attribution: r.creator ?? 'CC',
        payload: { url: imageUrl, attribution: r.creator, creatorUrl: r.creator_url },
      })
    }
    return items
  } catch (err) {
    console.warn('[images] Openverse search error', err)
    return []
  }
}

export async function searchImages(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'nature landscape' : raw

  const unsplashKey = getProviderKey('unsplash')
  const pexelsKey = getProviderKey('pexels')

  const [unsplash, pexels, openverse] = await Promise.all([
    searchUnsplash(q, unsplashKey),
    searchPexels(q, pexelsKey),
    searchOpenverse(q),
  ])

  const merged = dedupeItems([...unsplash, ...pexels, ...openverse])

  if (merged.length === 0) {
    return {
      section: {
        id: 'images',
        title: 'Images',
        source: 'No matches',
        error: `No photos found for "${q}". Try different words or add Unsplash/Pexels keys in Connections for more results.`,
        items: [],
        needsKey: !unsplashKey && !pexelsKey ? 'unsplash' : undefined,
      },
    }
  }

  const sources: string[] = []
  if (unsplash.length) sources.push('Unsplash')
  if (pexels.length) sources.push('Pexels')
  if (openverse.length && !unsplash.length && !pexels.length) sources.push('Openverse (free)')
  else if (openverse.length) sources.push('Openverse')

  return {
    section: {
      id: 'images',
      title: 'Images',
      source: sources.join(' + ') || 'Search',
      items: merged.slice(0, 32),
      more: merged.length > 32,
    },
  }
}
