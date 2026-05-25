import type { CSSProperties } from 'react'
import { displayAssetUrl } from '@/lib/asset-proxy'
import { blobToDataUrl, compressImage } from '@/lib/compress-image'
import type { ThemeConfig } from '@/themes'

export type PageBackgroundPreset = 'color' | 'gradient' | 'image'

export function isImageBackgroundUrl(value: string): boolean {
  const v = value.trim()
  return (
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/') ||
    v.startsWith('data:image/') ||
    v.startsWith('blob:')
  )
}

export function normalizePageBackgroundInput(raw: string): string | null {
  const v = raw.trim()
  return v.length > 0 ? v : null
}

/** Compress and store as data URL — works offline, no CORS. */
export async function pageBackgroundFromFile(file: File): Promise<{ background: string; size: string }> {
  const blob = await compressImage(file)
  const background = await blobToDataUrl(blob)
  return { background, size: 'cover' }
}

export function resolvePageBackgroundStyle(
  custom: string | null | undefined,
  customSize: string | null | undefined,
  theme: Pick<
    ThemeConfig,
    'pageBackground' | 'pageBackgroundSize' | 'pageBackgroundPosition' | 'pageBackgroundRepeat' | 'pageFallbackColor'
  >,
): CSSProperties {
  if (custom?.trim()) {
    const c = custom.trim()
    if (isImageBackgroundUrl(c)) {
      const url = c.startsWith('data:') || c.startsWith('blob:') ? c : displayAssetUrl(c)
      return {
        backgroundImage: `url("${url}")`,
        backgroundSize: customSize ?? 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: theme.pageFallbackColor,
      }
    }
    return {
      background: c,
      backgroundSize: customSize ?? undefined,
      backgroundRepeat: 'repeat',
    }
  }

  return {
    background: theme.pageBackground,
    backgroundSize: theme.pageBackgroundSize,
    backgroundPosition: theme.pageBackgroundPosition ?? 'center',
    backgroundRepeat: theme.pageBackgroundRepeat ?? 'repeat',
  }
}
