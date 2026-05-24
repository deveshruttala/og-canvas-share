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

/** Build embed iframe src for supported platforms */
export function getEmbedUrl(url: string, platform: LinkPlatform): string | null {
  try {
    const u = new URL(url)
    if (platform === 'youtube') {
      const id = u.searchParams.get('v') ?? u.pathname.split('/').pop()
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (platform === 'spotify') {
      return `https://open.spotify.com/embed${u.pathname}${u.search}`
    }
    if (platform === 'vimeo') {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    if (platform === 'soundcloud') {
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
