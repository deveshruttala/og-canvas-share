/** Normalize pasted URLs and detect image / embed-capable hosts. */

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)(\?.*)?$/i

const IMAGE_HOST_RE =
  /(?:images\.unsplash\.com|images\.pexels\.com|i\.pixabay\.com|upload\.wikimedia\.org|cdn\.|\.cloudfront\.net)/i

/** Hosts that reliably allow iframe embed (not OG link cards). */
const IFRAME_EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'open.spotify.com',
  'w.soundcloud.com',
  'cal.com',
  'app.cal.com',
])

export function normalizeWallUrl(raw: string): string {
  let v = raw.trim()
  if (!v) return v
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`

  try {
    const u = new URL(v)
    if (u.hostname === 'share.google') {
      u.hostname = 'share.google.com'
      return u.toString()
    }
    if (u.hostname.endsWith('.google') && !u.hostname.includes('.com')) {
      u.hostname = `${u.hostname}.com`
      return u.toString()
    }
    return u.toString()
  } catch {
    const fixed = v.replace(/^(https?:\/\/)([a-z0-9-]+)\/(.+)/i, '$1$2.com/$3')
    try {
      return new URL(fixed).toString()
    } catch {
      return v
    }
  }
}

export function isDirectImageUrl(url: string): boolean {
  const n = normalizeWallUrl(url)
  if (IMAGE_EXT.test(n)) return true
  try {
    const host = new URL(n).hostname
    return IMAGE_HOST_RE.test(host) || host.includes('googleusercontent.com')
  } catch {
    return false
  }
}

export function isAllowedEmbedIframeHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host === 'share.google.com' || host.endsWith('.google.com') && host.startsWith('share.')) {
      return false
    }
    return IFRAME_EMBED_HOSTS.has(host) || IFRAME_EMBED_HOSTS.has(`www.${host}`)
  } catch {
    return false
  }
}
