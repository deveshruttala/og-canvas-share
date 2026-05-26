import type { ProviderResult } from '@/providers/types'
import type { OmniItem } from '@/providers/types'
import { hasKey } from '@/lib/provider-config'
import { searchWikimediaImages } from '@/providers/image-sources/wikimedia'
import { searchWikipediaImages } from '@/providers/image-sources/wikipedia'
import { searchPexelsImages } from '@/providers/image-sources/pexels'
import { searchUnsplashImages } from '@/providers/image-sources/unsplash'
import { searchPixabayImages } from '@/providers/image-sources/pixabay'
import { searchOpenverseImages } from '@/providers/image-sources/openverse'
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

/** Prefer stock/CC photo APIs; museum catalogs fuzzy-match common words (e.g. "train"). */
function prefersMuseumCatalog(q: string): boolean {
  const lower = q.toLowerCase().trim()
  if (lower.length < 2) return false
  return /\b(painting|portrait|museum|artwork|renaissance|classical|baroque|sculpture|artist|oil on|watercolor|fresco|century|masterpiece|gallery|van gogh|monet|picasso)\b/i.test(
    lower,
  )
}

export async function searchImages(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'landscape nature' : raw
  const museumMode = prefersMuseumCatalog(q)

  const [openverse, pixabay, pexels, unsplash, wikipedia, wiki, met, artic] = await Promise.all([
    searchOpenverseImages(q, 28),
    searchPixabayImages(q, 20),
    searchPexelsImages(q, 20),
    searchUnsplashImages(q, 12),
    searchWikipediaImages(q, 12),
    searchWikimediaImages(q, museumMode ? 16 : 10),
    museumMode ? searchMetMuseumImages(q, 8) : Promise.resolve({ items: [], source: 'Met Museum' }),
    museumMode ? searchArticImages(q, 8) : Promise.resolve({ items: [], source: 'Art Institute' }),
  ])

  const stock = dedupeItems([
    ...openverse.items,
    ...pixabay.items,
    ...pexels.items,
    ...unsplash.items,
    ...wikipedia.items,
  ])

  const museumCap = museumMode ? 16 : stock.length >= 8 ? 0 : 4
  const museum = museumCap
    ? dedupeItems([
        ...(museumMode ? met.items : met.items.slice(0, 2)),
        ...(museumMode ? artic.items : artic.items.slice(0, 2)),
        ...wiki.items,
      ]).slice(0, museumCap)
    : dedupeItems([...wiki.items]).slice(0, 6)

  let merged = dedupeItems([...stock, ...museum])

  const sources: string[] = []
  if (openverse.items.length) sources.push('Openverse')
  if (pixabay.items.length) sources.push('Pixabay')
  if (pexels.items.length) sources.push('Pexels')
  if (unsplash.items.length) sources.push('Unsplash')
  if (wikipedia.items.length) sources.push('Wikipedia')
  if (wiki.items.length && museum.length) sources.push('Wikimedia')
  if (met.items.length && museumMode) sources.push('Met Museum')
  if (artic.items.length && museumMode) sources.push('Art Institute')

  const hints: string[] = []
  if (openverse.error && !openverse.items.length) hints.push(openverse.error)
  if (pixabay.error && hasKey('pixabay')) hints.push(pixabay.error)
  if (pexels.error && hasKey('pexels')) hints.push(pexels.error)
  if (unsplash.error && hasKey('unsplash')) hints.push(unsplash.error)

  let fallbackNote: string | undefined
  if (merged.length === 0) {
    const picsum = picsumFallbackImages(q, 20)
    merged = picsum.items
    sources.push(picsum.source)
    fallbackNote = picsum.error
  }

  const needsKey =
    !hasKey('pexels') && !hasKey('unsplash') && !hasKey('pixabay') && openverse.items.length < 8
      ? 'pixabay'
      : undefined

  const errorParts: string[] = []
  if (fallbackNote) {
    errorParts.push(fallbackNote)
  } else {
    if (hints.length && merged.length < 8) errorParts.push(hints.join(' · '))
    if (!museumMode && (met.items.length || artic.items.length) && stock.length >= 8) {
      /* museums skipped intentionally */
    } else if (
      !hasKey('pexels') &&
      !hasKey('unsplash') &&
      !hasKey('pixabay') &&
      openverse.items.length >= 8
    ) {
      errorParts.push('Stock photos via Openverse (free). Add Pixabay/Pexels keys in Connections for more.')
    } else if (!hasKey('pexels') && !hasKey('unsplash') && !hasKey('pixabay') && stock.length < 8) {
      errorParts.push('Add a free Pixabay or Pexels key in Connections for more stock photos.')
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
