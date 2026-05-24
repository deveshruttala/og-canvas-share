import type { ProviderResult } from '@/providers/types'
import { getProviderKey } from '@/lib/provider-config'

const DEMO_GIFS = [
  { id: 'g1', url: 'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif', title: 'Celebration' },
  { id: 'g2', url: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', title: 'Thumbs up' },
  { id: 'g3', url: 'https://media.giphy.com/media/26BRuo6sKon-oqyBU/giphy.gif', title: 'Dance' },
]

async function searchGiphy(q: string, key?: string) {
  const apiKey = key ?? 'GlVGYHkr3WSBnllca54iNt0yFyLpWLah'
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=8&rating=g`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.data ?? []).map(
    (g: { id: string; title: string; images: { fixed_height: { url: string } } }) => ({
      id: `giphy-${g.id}`,
      kind: 'gif' as const,
      title: g.title || 'GIF',
      thumb: g.images.fixed_height.url,
      previewUrl: g.images.fixed_height.url,
      source: 'Giphy',
      payload: { url: g.images.fixed_height.url },
    }),
  )
}

async function searchTenor(q: string, key?: string) {
  if (!key) return []
  const res = await fetch(
    `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${key}&limit=8`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).map(
    (g: { id: string; title?: string; media_formats: { gif: { url: string } } }) => ({
      id: `tenor-${g.id}`,
      kind: 'gif' as const,
      title: g.title ?? 'GIF',
      thumb: g.media_formats.gif.url,
      previewUrl: g.media_formats.gif.url,
      source: 'Tenor',
      payload: { url: g.media_formats.gif.url },
    }),
  )
}

export async function searchGifs(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (q.length < 2) return null

  const giphyKey = getProviderKey('giphy')
  const tenorKey = getProviderKey('tenor')

  const [g, t] = await Promise.all([searchGiphy(q, giphyKey), searchTenor(q, tenorKey)])
  let items = [...g, ...t]

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
  }

  return {
    section: {
      id: 'gifs',
      title: 'GIFs',
      source: [giphyKey && 'Giphy', tenorKey && 'Tenor'].filter(Boolean).join(' + ') || 'Demo',
      items: items.slice(0, 12),
      more: items.length > 12,
    },
  }
}
