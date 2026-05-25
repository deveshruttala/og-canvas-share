import type { ProviderResult } from '@/providers/types'
import { iconifySvgUrl } from '@/lib/iconify-url'

type IconifySearch = {
  icons?: string[]
}

/** Iconify — 200k+ icons, no key (primary icon search). */
export async function searchIconifyIcons(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().replace(/\bicons?\b/gi, '').trim()
  if (!q && !browse) return null
  const term = q || 'star'

  try {
    const params = new URLSearchParams({ query: term, limit: '32' })
    const res = await fetch(`https://api.iconify.design/search?${params}`)
    if (!res.ok) {
      return {
        section: {
          id: 'icons',
          title: 'Icons',
          source: 'Iconify',
          error: `Icon search failed (${res.status})`,
          items: [],
        },
      }
    }
    const data = (await res.json()) as IconifySearch
    const icons = data.icons ?? []
    if (!icons.length) return null

    const items = icons.map((iconId) => {
      const url = iconifySvgUrl(iconId)
      const [set, name] = iconId.split(':')
      return {
        id: `iconify-${iconId}`,
        kind: 'icon' as const,
        title: name ?? iconId,
        subtitle: set,
        thumb: url,
        icon: '◇',
        source: 'Iconify',
        payload: { iconifyId: iconId, iconUrl: url },
      }
    })

    return {
      section: {
        id: 'icons',
        title: 'Icons',
        source: `Iconify · ${icons.length} matches`,
        items,
        more: icons.length >= 32,
      },
    }
  } catch (err) {
    console.warn('[icons] Iconify error', err)
    return null
  }
}
