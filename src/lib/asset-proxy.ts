import { blobToDataUrl } from '@/lib/compress-image'

/** Same-origin proxy path (Vite dev middleware + nginx in Docker). */
export function getProxiedAssetUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  if (!/^https?:\/\//i.test(trimmed)) return trimmed
  return `/asset-proxy?url=${encodeURIComponent(trimmed)}`
}

/** Thumbnails / link previews — proxy remote URLs, leave local as-is. */
export function displayAssetUrl(url: string | undefined): string {
  if (!url) return ''
  return getProxiedAssetUrl(url)
}

/**
 * Load a remote image through the proxy and embed as a data URL so tldraw
 * and export do not depend on cross-origin asset hosts.
 */
export async function fetchExternalAssetAsDataUrl(url: string): Promise<string> {
  const proxied = getProxiedAssetUrl(url)
  const res = await fetch(proxied)
  if (!res.ok) throw new Error(`Could not load image (${res.status})`)
  const blob = await res.blob()
  if (!blob.type.startsWith('image/') && blob.size > 0) {
    /* some CDNs omit content-type */
  }
  return blobToDataUrl(blob)
}

export function isRemoteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}
