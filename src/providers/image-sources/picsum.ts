import type { ImageSourceResult } from '@/providers/image-sources/types'
import type { OmniItem } from '@/providers/types'

/** Deterministic seed from query string for stable placeholder grids. */
function querySeed(q: string): string {
  let h = 0
  for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) >>> 0
  return String(h || 42)
}

/**
 * Lorem Picsum — no search API, but gives usable photos when all stock APIs fail.
 * Clearly labeled so users know to add Pexels/Pixabay keys for real search.
 */
export function picsumFallbackImages(q: string, count = 18): ImageSourceResult {
  const seed = querySeed(q)
  const items: OmniItem[] = Array.from({ length: count }, (_, i) => {
    const id = `${seed}-${i}`
    const w = 480
    const h = 360
    const url = `https://picsum.photos/seed/${id}/${w * 2}/${h * 2}`
    const thumb = `https://picsum.photos/seed/${id}/${w}/${h}`
    return {
      id: `picsum-${id}`,
      kind: 'image' as const,
      title: `${q} · sample ${i + 1}`,
      subtitle: 'Add Pixabay/Pexels key in Connections for real stock search',
      thumb,
      previewUrl: url,
      source: 'Picsum',
      attribution: 'picsum.photos',
      payload: { url, attribution: 'Lorem Picsum' },
    }
  })
  return {
    items,
    source: 'Picsum (samples)',
    error:
      'Showing sample photos. Add a free Pixabay or Pexels API key in Connections for millions of searchable images.',
  }
}
