import type { ProviderResult } from '@/providers/types'
import type { OmniItem } from '@/providers/types'
import { hasKey } from '@/lib/provider-config'
import { searchWikimediaImages } from '@/providers/image-sources/wikimedia'
import { searchPixabayImages } from '@/providers/image-sources/pixabay'
import { searchPexelsImages } from '@/providers/image-sources/pexels'
import { searchUnsplashImages } from '@/providers/image-sources/unsplash'
import { searchMetMuseumImages } from '@/providers/image-sources/metmuseum'
import { searchArticImages } from '@/providers/image-sources/artic'
import { picsumFallbackImages } from '@/providers/image-sources/picsum'

function dedupeItems(items: OmniItem[]): OmniItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.thumb ?? item.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function searchImages(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'landscape nature' : raw

  const [wiki, met, artic, pixabay, pexels, unsplash] = await Promise.all([
    searchWikimediaImages(q, 16),
    searchMetMuseumImages(q, 8),
    searchArticImages(q, 8),
    searchPixabayImages(q, 20),
    searchPexelsImages(q, 16),
    searchUnsplashImages(q, 12),
  ])

  let merged = dedupeItems([
    ...pixabay.items,
    ...pexels.items,
    ...unsplash.items,
    ...met.items,
    ...artic.items,
    ...wiki.items,
  ])

  const sources: string[] = []
  if (pixabay.items.length) sources.push('Pixabay')
  if (pexels.items.length) sources.push('Pexels')
  if (unsplash.items.length) sources.push('Unsplash')
  if (met.items.length) sources.push('Met Museum')
  if (artic.items.length) sources.push('Art Institute')
  if (wiki.items.length) sources.push('Wikimedia')

  const hints: string[] = []
  if (pixabay.error && hasKey('pixabay')) hints.push(pixabay.error)
  if (pexels.error && hasKey('pexels')) hints.push(pexels.error)
  if (unsplash.error && hasKey('unsplash')) hints.push(unsplash.error)
  if (wiki.error && !wiki.items.length) hints.push(wiki.error)

  let fallbackNote: string | undefined
  if (merged.length === 0) {
    const picsum = picsumFallbackImages(q, 20)
    merged = picsum.items
    sources.push(picsum.source)
    fallbackNote = picsum.error
  }

  const needsKey =
    !hasKey('pixabay') && !hasKey('pexels') && !hasKey('unsplash') && merged.length < 12
      ? 'pixabay'
      : undefined

  const errorParts: string[] = []
  if (fallbackNote) {
    errorParts.push(fallbackNote)
  } else {
    if (hints.length && merged.length < 8) errorParts.push(hints.join(' · '))
    if (!hasKey('pixabay') && !hasKey('pexels') && (met.items.length || wiki.items.length)) {
      errorParts.push('Met + Wikimedia work without keys. Add Pixabay/Pexels for more stock photos.')
    }
  }

  return {
    section: {
      id: 'images',
      title: 'Images',
      source: sources.join(' · ') || 'Search',
      items: merged.slice(0, 40),
      more: merged.length > 40,
      error: errorParts.length ? errorParts.join(' ') : undefined,
      needsKey: fallbackNote ? needsKey : undefined,
    },
  }
}
