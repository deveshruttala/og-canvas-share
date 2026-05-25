import type { ProviderResult } from '@/providers/types'

function isJunkLinkUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    if (host.includes('duckduckgo')) return true
    if (host === 'google.com' && (u.pathname === '/search' || u.pathname.startsWith('/search'))) return true
    if (host === 'bing.com' && u.pathname === '/search') return true
    if (host === 'search.yahoo.com') return true
    return false
  } catch {
    return true
  }
}

async function searchWikipediaLinks(q: string): Promise<ProviderResult['section']['items']> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&format=json&origin=*`,
    )
    if (!res.ok) return []
    const [, titles, descriptions, urls] = (await res.json()) as [string, string[], string[], string[]]
    return titles
      .map((title, i) => ({
        title,
        subtitle: (descriptions[i] ?? '').replace(/<[^>]+>/g, '').slice(0, 100),
        url: urls[i],
      }))
      .filter((row) => row.url && !isJunkLinkUrl(row.url))
      .map((row, i) => ({
        id: `wiki-${i}-${row.url}`,
        kind: 'link' as const,
        title: row.title,
        subtitle: row.subtitle,
        url: row.url!,
        source: 'Wikipedia',
        payload: { url: row.url, title: row.title, description: row.subtitle },
      }))
  } catch {
    return []
  }
}

export async function searchLinks(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (q.length < 2) return null

  const items = await searchWikipediaLinks(q)

  if (items.length === 0) {
    return {
      section: {
        id: 'links',
        title: 'Links',
        source: 'No matches',
        error: `No reference links for "${q}". Use Images for photos, or paste a full https:// URL.`,
        items: [],
      },
    }
  }

  return {
    section: {
      id: 'links',
      title: 'Links · Reference',
      source: 'Wikipedia',
      items,
    },
  }
}
