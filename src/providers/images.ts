import type { ProviderResult } from '@/providers/types'
import { getProviderKey } from '@/lib/provider-config'

const DEMO_IMAGES = [
  {
    id: 'demo-1',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    title: 'Mountain sunset',
    author: 'Demo',
  },
  {
    id: 'demo-2',
    thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    full: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
    title: 'Foggy forest',
    author: 'Demo',
  },
  {
    id: 'demo-3',
    thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    full: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
    title: 'Nature valley',
    author: 'Demo',
  },
  {
    id: 'demo-4',
    thumb: 'https://images.unsplash.com/photo-1447752875215-b9821bf06482?w=400',
    full: 'https://images.unsplash.com/photo-1447752875215-b9821bf06482?w=1200',
    title: 'Minimal workspace',
    author: 'Demo',
  },
]

async function searchUnsplash(q: string, key?: string) {
  if (!key) return []
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
}

async function searchPexels(q: string, key?: string) {
  if (!key) return []
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
}

export async function searchImages(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (q.length < 2) return null

  const unsplashKey = getProviderKey('unsplash')
  const pexelsKey = getProviderKey('pexels')

  if (!unsplashKey && !pexelsKey) {
    const demo = DEMO_IMAGES.filter((d) => d.title.toLowerCase().includes(q.toLowerCase()) || q.length < 4)
    return {
      section: {
        id: 'images',
        title: 'Images',
        source: 'Demo (connect Unsplash / Pexels in Connections)',
        needsKey: 'unsplash',
        items: (demo.length ? demo : DEMO_IMAGES).map((d) => ({
          id: d.id,
          kind: 'image' as const,
          title: d.title,
          thumb: d.thumb,
          previewUrl: d.full,
          source: 'Demo',
          attribution: d.author,
          payload: { url: d.full, attribution: d.author },
        })),
      },
    }
  }

  const [u, p] = await Promise.all([searchUnsplash(q, unsplashKey), searchPexels(q, pexelsKey)])
  const seen = new Set<string>()
  const merged = [...u, ...p].filter((item) => {
    const h = item.thumb ?? item.id
    if (seen.has(h)) return false
    seen.add(h)
    return true
  })

  if (merged.length === 0) return null

  return {
    section: {
      id: 'images',
      title: 'Images',
      source: [unsplashKey && 'Unsplash', pexelsKey && 'Pexels'].filter(Boolean).join(' + '),
      items: merged.slice(0, 12),
      more: merged.length > 12,
    },
  }
}
