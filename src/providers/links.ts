import type { OmniItem, ProviderResult } from '@/providers/types'

type CuratedLink = {
  id: string
  title: string
  subtitle: string
  url: string
  icon: string
  keywords: string[]
}

export const CURATED_LINKS: CuratedLink[] = [
  { id: 'yt', title: 'YouTube', subtitle: 'Videos & music', url: 'https://www.youtube.com', icon: '▶️', keywords: ['youtube', 'video', 'watch'] },
  { id: 'spotify', title: 'Spotify', subtitle: 'Music streaming', url: 'https://open.spotify.com', icon: '🎵', keywords: ['spotify', 'music', 'playlist'] },
  { id: 'github', title: 'GitHub', subtitle: 'Code & projects', url: 'https://github.com', icon: '🐙', keywords: ['github', 'code', 'repo'] },
  { id: 'wiki', title: 'Wikipedia', subtitle: 'Encyclopedia', url: 'https://www.wikipedia.org', icon: '📚', keywords: ['wikipedia', 'wiki', 'article'] },
  { id: 'google', title: 'Google', subtitle: 'Search the web', url: 'https://www.google.com', icon: '🔎', keywords: ['google', 'search'] },
  { id: 'notion', title: 'Notion', subtitle: 'Notes & docs', url: 'https://www.notion.so', icon: '📓', keywords: ['notion', 'notes', 'docs'] },
  { id: 'figma', title: 'Figma', subtitle: 'Design files', url: 'https://www.figma.com', icon: '🎨', keywords: ['figma', 'design', 'ui'] },
  { id: 'twitter', title: 'X (Twitter)', subtitle: 'Social feed', url: 'https://x.com', icon: '𝕏', keywords: ['twitter', 'x', 'social'] },
  { id: 'instagram', title: 'Instagram', subtitle: 'Photos & reels', url: 'https://www.instagram.com', icon: '📷', keywords: ['instagram', 'photos', 'social'] },
  { id: 'linkedin', title: 'LinkedIn', subtitle: 'Professional network', url: 'https://www.linkedin.com', icon: '💼', keywords: ['linkedin', 'jobs', 'work'] },
  { id: 'reddit', title: 'Reddit', subtitle: 'Communities', url: 'https://www.reddit.com', icon: '🤖', keywords: ['reddit', 'forum', 'community'] },
  { id: 'discord', title: 'Discord', subtitle: 'Chat & communities', url: 'https://discord.com', icon: '💬', keywords: ['discord', 'chat', 'voice'] },
  { id: 'twitch', title: 'Twitch', subtitle: 'Live streams', url: 'https://www.twitch.tv', icon: '📺', keywords: ['twitch', 'stream', 'live'] },
  { id: 'soundcloud', title: 'SoundCloud', subtitle: 'Audio & podcasts', url: 'https://soundcloud.com', icon: '☁️', keywords: ['soundcloud', 'audio', 'music'] },
  { id: 'apple', title: 'Apple Music', subtitle: 'Streaming', url: 'https://music.apple.com', icon: '🍎', keywords: ['apple', 'music', 'itunes'] },
  { id: 'medium', title: 'Medium', subtitle: 'Articles & blogs', url: 'https://medium.com', icon: '✍️', keywords: ['medium', 'blog', 'article'] },
  { id: 'substack', title: 'Substack', subtitle: 'Newsletters', url: 'https://substack.com', icon: '📰', keywords: ['substack', 'newsletter', 'email'] },
  { id: 'producthunt', title: 'Product Hunt', subtitle: 'New products', url: 'https://www.producthunt.com', icon: '🚀', keywords: ['product', 'hunt', 'startup'] },
]

function curatedToItem(link: CuratedLink): OmniItem {
  return {
    id: `link-${link.id}`,
    kind: 'link',
    title: link.title,
    subtitle: link.subtitle,
    url: link.url,
    icon: link.icon,
    source: 'Quick links',
    payload: { url: link.url, title: link.title, description: link.subtitle },
  }
}

function scoreLink(link: CuratedLink, q: string): number {
  const hay = `${link.title} ${link.subtitle} ${link.keywords.join(' ')} ${link.url}`.toLowerCase()
  let score = 0
  for (const t of q.split(/\s+/).filter(Boolean)) {
    if (link.title.toLowerCase().startsWith(t)) score += 4
    if (hay.includes(t)) score += 2
    if (t.length === 1 && hay.includes(t)) score += 1
  }
  return score
}

function isJunkLinkUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    if (host.includes('duckduckgo')) return true
    if (host === 'google.com' && u.pathname.startsWith('/search')) return true
    if (host === 'bing.com' && u.pathname === '/search') return true
    if (host === 'search.yahoo.com') return true
    return false
  } catch {
    return true
  }
}

function tryParseUrlInput(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w-]+\.[\w.-]+/.test(trimmed) && !trimmed.includes(' ')) {
    return `https://${trimmed}`
  }
  return null
}

async function searchWikipediaLinks(q: string): Promise<OmniItem[]> {
  if (q.length < 2) return []
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=8&format=json&origin=*`,
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

export async function searchLinks(query: string, browse = false): Promise<ProviderResult | null> {
  const raw = query.trim()
  const q = raw.toLowerCase()

  const items: OmniItem[] = []

  const pasted = tryParseUrlInput(raw)
  if (pasted) {
    const normalized = pasted
    items.push({
      id: `link-paste-${normalized}`,
      kind: 'link',
      title: 'Add this URL to wall',
      subtitle: normalized,
      url: normalized,
      icon: '🔗',
      source: 'Paste',
      payload: { url: normalized, title: normalized },
    })
  }

  if (browse || !q) {
    items.push(...CURATED_LINKS.map(curatedToItem))
  } else {
    const curated = CURATED_LINKS.map((link) => ({ link, score: scoreLink(link, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => curatedToItem(r.link))
    items.push(...(curated.length ? curated : CURATED_LINKS.slice(0, 10).map(curatedToItem)))
  }

  const wiki = await searchWikipediaLinks(raw.length >= 2 ? raw : 'popular websites')
  const seen = new Set(items.map((i) => i.url))
  for (const w of wiki) {
    if (!seen.has(w.url)) {
      items.push(w)
      seen.add(w.url!)
    }
  }

  if (items.length === 0) {
    return {
      section: {
        id: 'links',
        title: 'Links',
        source: 'Quick links',
        error: 'Paste a full https:// URL or search for a site name.',
        items: CURATED_LINKS.slice(0, 8).map(curatedToItem),
      },
    }
  }

  return {
    section: {
      id: 'links',
      title: 'Links',
      source: [pasted && 'Paste', wiki.length && 'Wikipedia', 'Quick links'].filter(Boolean).join(' · ') || 'Quick links',
      items: items.slice(0, 24),
      more: items.length > 24,
    },
  }
}
