import { fetchOEmbed } from '@/lib/oembed'
import { isDirectImageUrl, normalizeWallUrl } from '@/lib/normalize-wall-url'

export type LinkMeta = {
  title?: string
  description?: string
  image?: string
}

function fallbackTitle(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '').split('/').pop()
    return path ? decodeURIComponent(path.replace(/-/g, ' ')) : u.hostname.replace(/^www\./, '')
  } catch {
    return 'Link'
  }
}

/** Microlink — long-tail OG only when oEmbed did not apply. */
async function fetchMicrolinkMeta(url: string, fallback: LinkMeta): Promise<LinkMeta> {
  try {
    const endpoint = `/microlink-api/?url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint)
    if (!res.ok) return fallback
    const data = (await res.json()) as {
      data?: { title?: string; description?: string; image?: { url?: string } }
    }
    return {
      title: data.data?.title ?? fallback.title,
      description: data.data?.description,
      image: data.data?.image?.url,
    }
  } catch {
    return fallback
  }
}

export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  const normalized = normalizeWallUrl(url)
  const fallback: LinkMeta = { title: fallbackTitle(normalized) }

  if (isDirectImageUrl(normalized)) {
    return {
      title: fallback.title,
      description: 'Image',
      image: normalized,
    }
  }

  const oembed = await fetchOEmbed(normalized)
  if (oembed?.title || oembed?.thumbnail) {
    return {
      title: oembed.title ?? fallback.title,
      description: oembed.author,
      image: oembed.thumbnail,
    }
  }

  return fetchMicrolinkMeta(normalized, fallback)
}
