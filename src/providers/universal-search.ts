import type { ProviderResult } from '@/providers/types'
import { buildPasteUrlItem, searchUniversalWeb } from '@/providers/link-helpers'

/** Paste URL + quick web results for the All tab only. */
export async function searchUniversalExtras(query: string): Promise<ProviderResult | null> {
  const raw = query.trim()
  const items = []

  const paste = buildPasteUrlItem(raw)
  if (paste) items.push(paste)

  if (raw.length >= 2 && !paste) {
    items.push(...(await searchUniversalWeb(raw)))
  }

  if (items.length === 0) return null

  return {
    section: {
      id: 'paste-url',
      title: 'Add to wall',
      source: 'Paste URLs · web',
      items: items.slice(0, 8),
    },
  }
}
