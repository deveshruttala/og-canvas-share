import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

type WikiSearchHit = { title: string; pageid: number }
type WikiPageImages = {
  pageid: number
  title: string
  thumbnail?: { source: string; width: number; height: number }
  original?: { source: string }
  pageimage?: string
}

/**
 * Wikipedia article images — uses topic-relevance search instead of file-name
 * search, so concrete subjects like "train" actually return the article's
 * hero photo. Free, no key, public CORS-friendly endpoint.
 */
export async function searchWikipediaImages(
  q: string,
  limit = 12,
  page = 1,
): Promise<ImageSourceResult> {
  const query = q.trim()
  if (query.length < 2) return { items: [], source: 'Wikipedia' }

  try {
    // Step 1 — find topical article pageids.
    const offset = Math.max(0, (page - 1) * limit)
    const searchParams = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srnamespace: '0',
      srlimit: String(Math.min(limit, 20)),
      sroffset: String(offset),
      format: 'json',
      origin: '*',
    })
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`)
    if (!searchRes.ok) {
      return { items: [], source: 'Wikipedia', error: `Wikipedia search failed (${searchRes.status})` }
    }
    const searchData = (await searchRes.json()) as { query?: { search?: WikiSearchHit[] } }
    const hits = searchData.query?.search ?? []
    if (!hits.length) return { items: [], source: 'Wikipedia' }

    // Step 2 — batch-fetch page images for those pageids.
    const pageids = hits
      .map((h) => h.pageid)
      .filter(Boolean)
      .slice(0, limit)
      .join('|')
    if (!pageids) return { items: [], source: 'Wikipedia' }

    const imgParams = new URLSearchParams({
      action: 'query',
      prop: 'pageimages',
      piprop: 'thumbnail|original|name',
      pithumbsize: '640',
      pageids,
      format: 'json',
      origin: '*',
    })
    const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?${imgParams}`)
    if (!imgRes.ok) {
      return { items: [], source: 'Wikipedia', error: `Wikipedia page images failed (${imgRes.status})` }
    }
    const imgData = (await imgRes.json()) as {
      query?: { pages?: Record<string, WikiPageImages> }
    }

    const items: OmniItem[] = []
    for (const page of Object.values(imgData.query?.pages ?? {})) {
      const thumb = page.thumbnail?.source
      const full = page.original?.source ?? thumb
      if (!thumb || !full) continue
      if (!/\.(jpe?g|png|webp)(\?|$)/i.test(thumb)) continue
      items.push({
        id: `wikipedia-${page.pageid}`,
        kind: 'image',
        title: page.title,
        thumb,
        previewUrl: full,
        source: 'Wikipedia',
        attribution: 'Wikipedia',
        payload: {
          url: full,
          attribution: 'Wikipedia',
          creatorUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/\s+/g, '_'))}`,
        },
      })
    }

    return { items, source: 'Wikipedia' }
  } catch (err) {
    console.warn('[images] Wikipedia error', err)
    return { items: [], source: 'Wikipedia', error: 'Wikipedia unavailable' }
  }
}
