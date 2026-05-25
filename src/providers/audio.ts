import type { ProviderResult } from '@/providers/types'
import { hasKey } from '@/lib/provider-config'
import { searchCuratedAudio } from '@/providers/audio-sources/curated'
import { searchInternetArchiveAudio } from '@/providers/audio-sources/archive'
import { searchPixabayAudio } from '@/providers/audio-sources/pixabay-audio'
import { searchFreesoundAudio } from '@/providers/audio-sources/freesound'
import { searchItunesMusic } from '@/providers/audio-sources/itunes'
import type { OmniItem } from '@/providers/types'

const MAX_ITEMS = 32

function dedupeItems(items: OmniItem[]): OmniItem[] {
  const seen = new Set<string>()
  const out: OmniItem[] = []
  for (const item of items) {
    const src = String(item.payload?.src ?? item.previewUrl ?? '')
    const key = src || item.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export async function searchAudio(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  if (raw.length < 2 && !browse) return null
  const q = raw.length < 2 ? 'lofi chill' : raw

  const [itunes, curated, archive, pixabay, freesound] = await Promise.all([
    searchItunesMusic(q, 14),
    Promise.resolve(searchCuratedAudio(q, 12)),
    searchInternetArchiveAudio(q, 4),
    searchPixabayAudio(q, 6),
    searchFreesoundAudio(q, 6),
  ])

  let items = dedupeItems([...itunes, ...curated, ...pixabay, ...freesound, ...archive])
  items = items.filter((item) => Boolean(item.payload?.src ?? item.previewUrl))

  const sources: string[] = []
  if (itunes.length) sources.push('iTunes previews')
  sources.push('Mixkit SFX')
  if (hasKey('pixabay')) sources.push('Pixabay')
  if (hasKey('freesound')) sources.push('Freesound')
  if (archive.length) sources.push('Internet Archive')

  const needsKey =
    !itunes.length && !hasKey('pixabay') && !hasKey('freesound') ? 'pixabay' : undefined

  if (items.length === 0) return null

  return {
    section: {
      id: 'audio',
      title: 'Audio',
      source: sources.join(' · '),
      needsKey,
      items: items.slice(0, MAX_ITEMS),
      more: items.length > MAX_ITEMS,
      error: !itunes.length
        ? 'Song search uses iTunes previews (no key). Add Pixabay/Freesound keys for more SFX.'
        : undefined,
    },
  }
}
