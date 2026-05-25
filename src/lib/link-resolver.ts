/**
 * Detects popular platforms from URLs for rich link cards and embeds.
 */
export type LinkPlatform =
  | 'youtube'
  | 'spotify'
  | 'twitter'
  | 'github'
  | 'instagram'
  | 'tiktok'
  | 'vimeo'
  | 'soundcloud'
  | 'bandcamp'
  | 'generic'

const PATTERNS: Array<{ platform: LinkPlatform; test: RegExp }> = [
  { platform: 'youtube', test: /(?:youtube\.com|youtu\.be)/i },
  { platform: 'spotify', test: /open\.spotify\.com/i },
  { platform: 'twitter', test: /(?:twitter\.com|x\.com)/i },
  { platform: 'github', test: /github\.com/i },
  { platform: 'instagram', test: /instagram\.com/i },
  { platform: 'tiktok', test: /tiktok\.com/i },
  { platform: 'vimeo', test: /vimeo\.com/i },
  { platform: 'soundcloud', test: /soundcloud\.com/i },
  { platform: 'bandcamp', test: /bandcamp\.com/i },
]

export function detectLinkPlatform(url: string): LinkPlatform {
  for (const { platform, test } of PATTERNS) {
    if (test.test(url)) return platform
  }
  return 'generic'
}

/** Extract a YouTube video id from watch, embed, shorts, or youtu.be URLs. */
export function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id && id.length >= 6 ? id : null
    }
    if (!host.includes('youtube.com')) return null
    const v = u.searchParams.get('v')
    if (v && v.length >= 6) return v
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
      const id = parts[1]
      return id && id.length >= 6 ? id : null
    }
    return null
  } catch {
    return null
  }
}

const SPOTIFY_EMBED_PATH =
  /^\/(track|album|playlist|episode|show|artist|audiobook|concert|station)\/[\w-]+/i

/** True when URL can load in an iframe player (not a bare homepage). */
export function isEmbeddableUrl(url: string): boolean {
  const platform = detectLinkPlatform(url)
  return Boolean(getEmbedUrl(url, platform))
}

/** Build embed iframe src for supported platforms */
export function getEmbedUrl(url: string, platform: LinkPlatform): string | null {
  try {
    const u = new URL(url)
    if (platform === 'youtube') {
      const id = extractYoutubeVideoId(url)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (platform === 'spotify') {
      const path = u.pathname.replace(/\/$/, '') || ''
      if (!path || path === '' || !SPOTIFY_EMBED_PATH.test(path)) return null
      return `https://open.spotify.com/embed${path}${u.search}`
    }
    if (platform === 'vimeo') {
      const parts = u.pathname.split('/').filter(Boolean)
      const id = parts[0] === 'video' ? parts[1] : parts.pop()
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
    if (platform === 'soundcloud') {
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length < 2) return null
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff6b35`
    }
  } catch {
    return null
  }
  return null
}

export function platformLabel(platform: LinkPlatform): string {
  const labels: Record<LinkPlatform, string> = {
    youtube: 'YouTube',
    spotify: 'Spotify',
    twitter: 'X / Twitter',
    github: 'GitHub',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    vimeo: 'Vimeo',
    soundcloud: 'SoundCloud',
    bandcamp: 'Bandcamp',
    generic: 'Link',
  }
  return labels[platform]
}
