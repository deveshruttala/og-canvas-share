/** Helpers for custom page background strings stored on CanvasDoc. */

export type PageBackgroundPreset = 'color' | 'gradient' | 'image'

export function isImageBackgroundUrl(value: string): boolean {
  const v = value.trim()
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/') || v.startsWith('data:image/')
}

export function normalizePageBackgroundInput(raw: string): string | null {
  const v = raw.trim()
  return v.length > 0 ? v : null
}
