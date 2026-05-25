import { blobToDataUrl } from '@/lib/compress-image'

/** Same-origin proxy path (Vite dev middleware + nginx in Docker). */
export function getProxiedAssetUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  if (!/^https?:\/\//i.test(trimmed)) return trimmed
  return `/asset-proxy?url=${encodeURIComponent(trimmed)}`
}

/** CDNs that allow browser hotlinking — skip proxy to avoid rate limits (esp. Wikimedia 429). */
const DIRECT_THUMB_HOSTS = [
  'upload.wikimedia.org',
  'images.pexels.com',
  'images.unsplash.com',
  'cdn.pixabay.com',
  'i.pixabay.com',
  'picsum.photos',
  'fastly.picsum.photos',
  'media.giphy.com',
  'media.tenor.com',
  'c.tenor.com',
  'api.iconify.design',
]

function canLoadThumbDirect(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return DIRECT_THUMB_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

/** Search grid / picker thumbnails — direct CDN when safe, else same-origin proxy. */
export function displayThumbUrl(url: string | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed
  }
  if (canLoadThumbDirect(trimmed)) return trimmed
  return getProxiedAssetUrl(trimmed)
}

/** Canvas / link previews — always proxy remote URLs for embedding consistency. */
export function displayAssetUrl(url: string | undefined): string {
  if (!url) return ''
  return getProxiedAssetUrl(url)
}

/** Ordered candidates for <img> when a thumb URL fails (direct → proxy → larger preview). */
export function thumbUrlCandidates(thumb?: string, preview?: string): string[] {
  const raw = [thumb, preview].filter((u): u is string => Boolean(u?.trim()))
  const out: string[] = []
  for (const u of raw) {
    const direct = displayThumbUrl(u)
    const proxied = getProxiedAssetUrl(u)
    if (direct && !out.includes(direct)) out.push(direct)
    if (proxied !== direct && !out.includes(proxied)) out.push(proxied)
  }
  return out
}

/**
 * Load a remote image through the proxy and embed as a data URL so tldraw
 * and export do not depend on cross-origin asset hosts.
 */
export async function fetchExternalAssetAsDataUrl(url: string): Promise<string> {
  const trimmed = url.trim()
  const attempts = canLoadThumbDirect(trimmed)
    ? [trimmed, getProxiedAssetUrl(trimmed)]
    : [getProxiedAssetUrl(trimmed), trimmed]

  let lastStatus = 0
  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt)
      lastStatus = res.status
      if (!res.ok) continue
      const blob = await res.blob()
      if (blob.type.startsWith('text/html')) continue
      return blobToDataUrl(blob)
    } catch {
      /* try next */
    }
  }
  throw new Error(`Could not load image (${lastStatus || 'network'})`)
}

export function isRemoteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}
