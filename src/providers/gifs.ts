import type { OmniItem, ProviderResult } from '@/providers/types'
import { getProviderKey } from '@/lib/provider-config'
import { displayThumbUrl } from '@/lib/asset-proxy'

const OPENVERSE_GIF_BASE = '/openverse-api/v1/images/'

const DEMO_GIFS = [
  { id: 'g1', url: 'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif', title: 'Celebration' },
  { id: 'g2', url: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', title: 'Thumbs up' },
  { id: 'g3', url: 'https://media.giphy.com/media/26BRuo6sKon-oqyBU/giphy.gif', title: 'Dance' },
]

function dedupeItems(items: OmniItem[]): OmniItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.payload?.url as string | undefined ?? item.thumb ?? item.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mapGiphyItem(g: {
  id: string
  title: string
  images: { fixed_height?: { url: string }; downsized_medium?: { url: string } }
}): OmniItem | null {
  const url = g.images.fixed_height?.url ?? g.images.downsized_medium?.url
  if (!url) return null
  return {
    id: `giphy-${g.id}`,
    kind: 'gif',
    title: g.title || 'GIF',
    thumb: url,
    previewUrl: url,
    source: 'Giphy',
    payload: { url },
  }
}

type WikiGifHit = {
  pageid: number
  title?: string
  imageinfo?: Array<{ url?: string; thumburl?: string; mime?: string }>
}

/** Wikimedia Commons GIFs — free, no API key, reliable. */
async function searchWikimediaGifs(q: string, limit = 24): Promise<OmniItem[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: `filetype:image ${q} .gif`,
      gsrnamespace: '6',
      gsrlimit: String(Math.min(limit, 30)),
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '320',
    })
    const res = await fetch(`/wall-img-api/wikimedia?${params.toString()}`)
    if (!res.ok) return []
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiGifHit> } }
    const pages = Object.values(data.query?.pages ?? {})
    const items: OmniItem[] = []
    for (const page of pages) {
      const info = page.imageinfo?.[0]
      const fullUrl = info?.url
      const thumb = info?.thumburl ?? fullUrl
      if (!fullUrl || !thumb) continue
      // Wikimedia search with `filetype:image` returns mixed results; keep .gif only
      if (!/\.gif(\?|$)/i.test(fullUrl)) continue
      const title = (page.title ?? 'GIF').replace(/^File:/, '').replace(/\.[^.]+$/, '')
      items.push({
        id: `wiki-gif-${page.pageid}`,
        kind: 'gif',
        title,
        thumb,
        previewUrl: fullUrl,
        source: 'Wikimedia',
        attribution: 'Wikimedia Commons',
        payload: { url: fullUrl, attribution: 'Wikimedia Commons' },
      })
    }
    return items
  } catch {
    return []
  }
}

/** Free CC / Wikimedia animated GIFs — no API key. */
async function searchOpenverseGifs(q: string, limit = 24): Promise<OmniItem[]> {
  try {
    const url = `${OPENVERSE_GIF_BASE}?q=${encodeURIComponent(q)}&page_size=${limit}&extension=gif`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn('[gifs] Openverse GIF search failed', res.status)
      return []
    }
    const data = (await res.json()) as {
      results?: Array<{
        id: string
        title?: string
        url?: string
        thumbnail?: string
        filetype?: string
      }>
    }
    return (data.results ?? [])
      .filter((r) => r.url && (r.filetype === 'gif' || r.url.toLowerCase().includes('.gif')))
      .map((r) => ({
        id: `openverse-gif-${r.id}`,
        kind: 'gif' as const,
        title: r.title?.trim() || q,
        thumb: r.thumbnail ?? r.url!,
        previewUrl: r.url!,
        source: 'Openverse',
        payload: { url: r.url! },
      }))
  } catch {
    return []
  }
}

async function searchGiphy(q: string, key?: string, limit = 24): Promise<OmniItem[]> {
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=${limit}&rating=g`,
    )
    if (!res.ok) return []
    const data = await res.json()
    if (data.meta?.status === 401 || data.meta?.status === 403) return []
    return (data.data ?? [])
      .map(mapGiphyItem)
      .filter((item: OmniItem | null): item is OmniItem => item != null)
  } catch {
    return []
  }
}

async function searchGiphyTrending(key: string, limit = 24): Promise<OmniItem[]> {
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(key)}&limit=${limit}&rating=g`,
    )
    if (!res.ok) return []
    const data = await res.json()
    if (data.meta?.status === 401 || data.meta?.status === 403) return []
    return (data.data ?? [])
      .map(mapGiphyItem)
      .filter((item: OmniItem | null): item is OmniItem => item != null)
  } catch {
    return []
  }
}

async function searchTenor(q: string, key?: string, limit = 24): Promise<OmniItem[]> {
  if (!key) return []
  try {
    const res = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}&limit=${limit}`,
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? [])
      .map(
        (g: {
          id: string
          title?: string
          media_formats?: { gif?: { url: string }; mediumgif?: { url: string } }
        }) => {
          const gifUrl = g.media_formats?.gif?.url ?? g.media_formats?.mediumgif?.url
          if (!gifUrl) return null
          return {
            id: `tenor-${g.id}`,
            kind: 'gif' as const,
            title: g.title ?? 'GIF',
            thumb: gifUrl,
            previewUrl: gifUrl,
            source: 'Tenor',
            payload: { url: gifUrl },
          }
        },
      )
      .filter((item: OmniItem | null): item is OmniItem => item != null)
  } catch {
    return []
  }
}

export type GifPickItem = { id: string; url: string; title: string; thumb: string }

export async function fetchGifPickerResults(query: string): Promise<{
  items: GifPickItem[]
  error?: string
  source?: string
}> {
  const raw = query.trim()
  const trending = raw.length === 0 || raw === 'trending'
  const searchQ = trending ? 'celebration' : raw

  const giphyKey = getProviderKey('giphy')
  const tenorKey = getProviderKey('tenor')
  const limit = 48

  const [openverse, giphy, tenor, giphyTrending] = await Promise.all([
    searchOpenverseGifs(searchQ, limit),
    trending ? Promise.resolve([]) : searchGiphy(searchQ, giphyKey, limit),
    trending ? Promise.resolve([]) : searchTenor(searchQ, tenorKey, limit),
    trending && giphyKey ? searchGiphyTrending(giphyKey, limit) : Promise.resolve([]),
  ])

  let items = dedupeItems([...giphyTrending, ...giphy, ...tenor, ...openverse])

  if (items.length === 0 && trending) {
    items = dedupeItems(await searchOpenverseGifs('funny', limit))
  }

  if (items.length === 0) {
    items = DEMO_GIFS.map((d) => ({
      id: d.id,
      kind: 'gif' as const,
      title: d.title,
      thumb: d.url,
      previewUrl: d.url,
      source: 'Demo',
      payload: { url: d.url },
    }))
    const hint =
      !giphyKey && !tenorKey
        ? `No GIFs for "${searchQ}". Showing samples — add a Giphy key in Connections for full search.`
        : `No GIFs found for "${searchQ}". Showing samples.`
    return {
      items: items.map(toPickItem),
      error: hint,
      source: 'Demo',
    }
  }

  const sources: string[] = []
  if (giphy.length || giphyTrending.length) sources.push('Giphy')
  if (tenor.length) sources.push('Tenor')
  if (openverse.length) sources.push('Openverse')

  return {
    items: items.map(toPickItem),
    source: sources.join(' + ') || 'Search',
  }
}

function toPickItem(item: OmniItem): GifPickItem {
  const url = String((item.payload as { url?: string })?.url ?? item.previewUrl ?? '')
  return {
    id: item.id,
    title: item.title,
    url,
    thumb: displayThumbUrl(item.thumb ?? url),
  }
}

export async function searchGifs(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'fun' : raw

  const giphyKey = getProviderKey('giphy')
  const tenorKey = getProviderKey('tenor')

  const [openverse, wikimedia, giphy, tenor] = await Promise.all([
    searchOpenverseGifs(q, 20),
    searchWikimediaGifs(q, 16),
    searchGiphy(q, giphyKey, 20),
    searchTenor(q, tenorKey, 20),
  ])

  const merged = dedupeItems([...giphy, ...tenor, ...openverse, ...wikimedia])

  if (merged.length === 0) {
    return {
      section: {
        id: 'gifs',
        title: 'GIFs',
        source: 'No matches',
        error: !giphyKey && !tenorKey
          ? `No GIFs for "${q}". Free sources (Openverse + Wikimedia) had no matches — add a Giphy or Tenor key in Connections.`
          : `No GIFs found for "${q}".`,
        items: [],
        needsKey: !giphyKey && !tenorKey ? 'giphy' : undefined,
      },
    }
  }

  const sources: string[] = []
  if (giphy.length) sources.push('Giphy')
  if (tenor.length) sources.push('Tenor')
  if (openverse.length) sources.push('Openverse (free)')
  if (wikimedia.length) sources.push('Wikimedia (free)')

  return {
    section: {
      id: 'gifs',
      title: 'GIFs',
      source: sources.join(' + ') || 'Search',
      items: merged.slice(0, 32),
      more: merged.length > 32,
    },
  }
}
