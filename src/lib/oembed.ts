/**
 * Native oEmbed endpoints first; Microlink only when no pattern matches (saves quota).
 */
import { detectLinkPlatform, getEmbedUrl, isEmbeddableUrl, type LinkPlatform } from '@/lib/link-resolver'
import { isAllowedEmbedIframeHost, normalizeWallUrl } from '@/lib/normalize-wall-url'

export type OEmbedResult = {
  title?: string
  author?: string
  thumbnail?: string
  html?: string
  /** Direct iframe src when we can derive it without html */
  embedUrl?: string
  provider?: string
}

type OEmbedProvider = {
  id: string
  test: RegExp
  endpoint: (url: string) => string
  platforms?: LinkPlatform[]
}

const OEMBED_PROVIDERS: OEmbedProvider[] = [
  {
    id: 'youtube',
    test: /(?:youtube\.com|youtu\.be)/i,
    endpoint: (u) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u)}`,
    platforms: ['youtube'],
  },
  {
    id: 'vimeo',
    test: /vimeo\.com/i,
    endpoint: (u) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(u)}`,
    platforms: ['vimeo'],
  },
  {
    id: 'spotify',
    test: /open\.spotify\.com/i,
    endpoint: (u) => `https://open.spotify.com/oembed?url=${encodeURIComponent(u)}`,
    platforms: ['spotify'],
  },
  {
    id: 'soundcloud',
    test: /soundcloud\.com/i,
    endpoint: (u) => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(u)}`,
    platforms: ['soundcloud'],
  },
  {
    id: 'twitter',
    test: /(?:twitter\.com|x\.com)\/(?!home)/i,
    endpoint: (u) => `https://publish.twitter.com/oembed?url=${encodeURIComponent(u)}&omit_script=1`,
    platforms: ['twitter'],
  },
  {
    id: 'tiktok',
    test: /tiktok\.com/i,
    endpoint: (u) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(u)}`,
    platforms: ['tiktok'],
  },
  {
    id: 'codepen',
    test: /codepen\.io/i,
    endpoint: (u) => `https://codepen.io/api/oembed?url=${encodeURIComponent(u)}`,
  },
  {
    id: 'speakerdeck',
    test: /speakerdeck\.com/i,
    endpoint: (u) => `https://speakerdeck.com/oembed.json?url=${encodeURIComponent(u)}`,
  },
  {
    id: 'reddit',
    test: /reddit\.com/i,
    endpoint: (u) => `https://www.reddit.com/oembed?url=${encodeURIComponent(u)}`,
  },
]

function findProvider(url: string): OEmbedProvider | undefined {
  return OEMBED_PROVIDERS.find((p) => p.test.test(url))
}

function parseOEmbedJson(data: Record<string, unknown>, url: string): OEmbedResult {
  const platform = detectLinkPlatform(url)
  const embedFromHtml =
    typeof data.html === 'string' && data.html.includes('iframe')
      ? extractIframeSrc(data.html)
      : null
  let embedUrl = embedFromHtml ?? getEmbedUrl(url, platform) ?? undefined
  if (embedUrl && !isAllowedEmbedIframeHost(embedUrl)) {
    embedUrl = undefined
  }

  return {
    title: typeof data.title === 'string' ? data.title : undefined,
    author: typeof data.author_name === 'string' ? data.author_name : undefined,
    thumbnail: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined,
    html: typeof data.html === 'string' ? data.html : undefined,
    embedUrl: embedUrl ?? undefined,
    provider: typeof data.provider_name === 'string' ? data.provider_name : platform,
  }
}

function extractIframeSrc(html: string): string | null {
  const m = html.match(/src=["']([^"']+)["']/i)
  return m?.[1] ?? null
}

export async function fetchOEmbed(url: string): Promise<OEmbedResult | null> {
  const normalized = normalizeWallUrl(url)
  const provider = findProvider(normalized)
  if (!provider) return null

  try {
    const res = await fetch(provider.endpoint(normalized), {
      headers: { Accept: 'application/json', 'User-Agent': 'WallCanvas/1.0' },
    })
    if (!res.ok) {
      const platform = detectLinkPlatform(normalized)
      const fallback = getEmbedUrl(normalized, platform)
      if (fallback) {
        return { embedUrl: fallback, provider: platform }
      }
      return null
    }
    const text = await res.text()
    if (!text.trim()) {
      const platform = detectLinkPlatform(normalized)
      const fallback = getEmbedUrl(normalized, platform)
      return fallback ? { embedUrl: fallback, provider: platform } : null
    }
    const data = JSON.parse(text) as Record<string, unknown>
    return parseOEmbedJson(data, normalized)
  } catch {
    const platform = detectLinkPlatform(normalized)
    const fallback = getEmbedUrl(normalized, platform)
    return fallback ? { embedUrl: fallback, provider: platform } : null
  }
}

export function canNativeEmbed(url: string): boolean {
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
  if (!findProvider(normalized)) return false
  return isEmbeddableUrl(normalized)
}

export function listOEmbedProviderIds(): string[] {
  return OEMBED_PROVIDERS.map((p) => p.id)
}
