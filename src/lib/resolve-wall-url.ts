import { fetchLinkMeta } from '@/lib/extract-link-meta'
import { canNativeEmbed, fetchOEmbed } from '@/lib/oembed'
import { detectLinkPlatform, isEmbeddableUrl } from '@/lib/link-resolver'
import { isAllowedEmbedIframeHost, isDirectImageUrl, normalizeWallUrl } from '@/lib/normalize-wall-url'

export type WallUrlResolution = {
  url: string
  action: 'embed' | 'link'
  embedUrl?: string
  meta?: { title?: string; description?: string; image?: string }
}

export async function resolveWallUrl(raw: string): Promise<WallUrlResolution> {
  const url = normalizeWallUrl(raw)

  if (isDirectImageUrl(url)) {
    const meta = await fetchLinkMeta(url)
    return { url, action: 'link', meta }
  }

  if (canNativeEmbed(url) && isEmbeddableUrl(url)) {
    const oembed = await fetchOEmbed(url)
    const embedUrl = oembed?.embedUrl
    if (embedUrl && isAllowedEmbedIframeHost(embedUrl) && isEmbeddableUrl(embedUrl)) {
      return {
        url,
        action: 'embed',
        embedUrl,
        meta: {
          title: oembed.title,
          description: oembed.author,
          image: oembed.thumbnail,
        },
      }
    }
    if (oembed?.thumbnail || oembed?.title) {
      return {
        url,
        action: 'link',
        meta: {
          title: oembed.title,
          description: oembed.author,
          image: oembed.thumbnail,
        },
      }
    }
  }

  const meta = await fetchLinkMeta(url)
  return { url, action: 'link', meta }
}

export function isHttpUrl(text: string): boolean {
  return /^https?:\/\/\S+/i.test(text.trim()) || /^[\w-]+\.[\w.-]+\/\S*/i.test(text.trim())
}

export function platformFromUrl(url: string): string {
  return detectLinkPlatform(url)
}
