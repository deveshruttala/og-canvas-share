import type { OmniItem, ProviderResult } from '@/providers/types'
import { canNativeEmbed } from '@/lib/oembed'
import { isEmbeddableUrl } from '@/lib/link-resolver'
import { resolveWallUrl, isHttpUrl } from '@/lib/resolve-wall-url'
import { CURATED_LINKS, curatedToItem, scoreLink } from '@/providers/link-curated'
import { WIDGET_CATALOG } from '@/widgets/catalog'

export { CURATED_LINKS } from '@/providers/link-curated'

export function tryParseUrlInput(raw: string): string | null {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w-]+\.[\w.-]+/.test(trimmed) && !trimmed.includes(' ')) {
    return `https://${trimmed}`
  }
  return null
}

/** Paste a URL → embed player or rich link card. */
export function buildPasteUrlItem(raw: string): OmniItem | null {
  const pasted = tryParseUrlInput(raw)
  if (!pasted) return null
  const embed = canNativeEmbed(pasted) && isEmbeddableUrl(pasted)
  return {
    id: `paste-${pasted}`,
    kind: embed ? ('action' as const) : ('link' as const),
    title: embed ? 'Embed player on wall' : 'Add link card',
    subtitle: pasted,
    url: pasted,
    icon: embed ? '▶️' : '🔗',
    source: 'Paste URL',
    payload: {
      url: pasted,
      run: async () => {
        const { wallActions } = await import('@/editor/wall-actions')
        const resolved = await resolveWallUrl(pasted)
        if (resolved.action === 'embed' && resolved.embedUrl) {
          wallActions.addEmbed(pasted, resolved.embedUrl)
        } else {
          await wallActions.addLink(pasted, undefined, undefined, resolved.meta)
        }
      },
    },
  }
}

/** Notion, GitHub, Figma, etc. — as widgets or link cards from the library. */
export function searchServiceWidgets(query: string, browse = false): OmniItem[] {
  const q = query.trim().toLowerCase()
  const items: OmniItem[] = []

  const catalogMatches = WIDGET_CATALOG.filter((w) => {
    if (w.template !== 'link' && w.category !== 'links') return false
    if (!q && browse) return true
    const hay = `${w.name} ${w.description} ${w.tags.join(' ')}`.toLowerCase()
    return !q || hay.includes(q) || w.tags.some((t) => q.includes(t))
  }).map((w) => ({
    id: `widget-${w.id}`,
    kind: 'widget' as const,
    title: w.name,
    subtitle: w.description,
    icon: w.icon,
    source: 'Widget library',
    payload: { catalogId: w.id },
  }))

  const curatedList =
    browse || !q
      ? CURATED_LINKS
      : CURATED_LINKS.map((link) => ({ link, score: scoreLink(link, q) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.link)

  const curated = curatedList.slice(0, browse ? 12 : 10).map((link) => curatedToItem(link))

  const seen = new Set<string>()
  for (const row of [...catalogMatches, ...curated]) {
    const key = row.id
    if (seen.has(key)) continue
    seen.add(key)
    items.push(row)
  }
  return items
}

type DdgTopic = { Text?: string; FirstURL?: string }
type DdgTopicGroup = { Topics?: DdgTopic[] }
type DdgResponse = {
  AbstractURL?: string
  AbstractText?: string
  Heading?: string
  RelatedTopics?: Array<DdgTopic | DdgTopicGroup>
}

function isDdgTopicGroup(t: DdgTopic | DdgTopicGroup): t is DdgTopicGroup {
  return 'Topics' in t && Array.isArray(t.Topics)
}

async function searchDuckDuckGo(q: string): Promise<OmniItem[]> {
  if (q.length < 2) return []
  try {
    const params = new URLSearchParams({ q, format: 'json', no_redirect: '1', no_html: '1' })
    const res = await fetch(`https://api.duckduckgo.com/?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as DdgResponse
    const rows: { title: string; url: string; subtitle?: string }[] = []
    if (data.AbstractURL) {
      rows.push({
        title: data.Heading ?? 'Top result',
        url: data.AbstractURL,
        subtitle: data.AbstractText?.slice(0, 100),
      })
    }
    for (const topic of data.RelatedTopics ?? []) {
      if (isDdgTopicGroup(topic)) {
        for (const t of topic.Topics ?? []) {
          if (t.FirstURL) rows.push({ title: t.Text?.split(' - ')[0] ?? 'Link', url: t.FirstURL })
        }
      } else if (topic.FirstURL) {
        rows.push({ title: topic.Text?.split(' - ')[0] ?? 'Link', url: topic.FirstURL })
      }
    }
    return rows.slice(0, 6).map((row, i) => ({
      id: `ddg-${i}-${row.url}`,
      kind: 'link' as const,
      title: row.title,
      subtitle: row.subtitle ?? 'Web',
      url: row.url,
      source: 'Web',
      payload: { url: row.url, title: row.title, description: row.subtitle },
    }))
  } catch {
    return []
  }
}

/** Lightweight web results for universal (All) search only. */
export async function searchUniversalWeb(query: string): Promise<OmniItem[]> {
  if (isHttpUrl(query)) return []
  const q = query.trim()
  if (q.length < 2) return []
  return searchDuckDuckGo(q)
}

/** Paste URL row when searching in any category. */
export async function searchPasteUrl(query: string): Promise<ProviderResult | null> {
  const paste = buildPasteUrlItem(query)
  if (!paste) return null
  return {
    section: {
      id: 'paste-url',
      title: 'Paste URL',
      source: 'Add to wall',
      items: [paste],
    },
  }
}
