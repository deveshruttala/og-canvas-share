import type { ProviderResult } from '@/providers/types'

export async function searchLinks(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (q.length < 2) return null

  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`)
    const data = await res.json()
    const items: ProviderResult['section']['items'] = []

    if (data.AbstractURL) {
      items.push({
        id: 'ddg-abstract',
        kind: 'link',
        title: data.Heading || q,
        subtitle: data.Abstract?.slice(0, 80),
        url: data.AbstractURL,
        source: 'DuckDuckGo',
      })
    }

    for (const topic of (data.RelatedTopics ?? []).slice(0, 4)) {
      if (topic.FirstURL) {
        items.push({
          id: `ddg-${topic.FirstURL}`,
          kind: 'link',
          title: topic.Text?.slice(0, 60) ?? 'Related',
          url: topic.FirstURL,
          source: 'DuckDuckGo',
        })
      }
    }

    if (items.length === 0) {
      items.push({
        id: 'link-suggest',
        kind: 'link',
        title: `Search: ${q}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        source: 'Suggested',
      })
    }

    return {
      section: {
        id: 'links',
        title: 'Links · Suggested',
        source: 'DuckDuckGo',
        items,
      },
    }
  } catch {
    return null
  }
}
