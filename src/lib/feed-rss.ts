export type RssItem = {
  title: string
  link?: string
  date?: string
  summary?: string
}

/** Fetch RSS/Atom via same-origin asset proxy (feeds block browser CORS). */
export async function fetchRssFeed(feedUrl: string, limit = 5): Promise<RssItem[]> {
  const proxied = `/asset-proxy?url=${encodeURIComponent(feedUrl)}`
  const res = await fetch(proxied)
  if (!res.ok) throw new Error(`Feed unavailable (${res.status})`)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  if (doc.querySelector('parsererror')) throw new Error('Invalid feed XML')

  const atom = doc.querySelectorAll('entry')
  if (atom.length) {
    return Array.from(atom)
      .slice(0, limit)
      .map((entry) => ({
        title: entry.querySelector('title')?.textContent?.trim() ?? 'Item',
        link:
          entry.querySelector('link[href]')?.getAttribute('href') ??
          entry.querySelector('id')?.textContent ??
          undefined,
        date: entry.querySelector('published, updated')?.textContent ?? undefined,
        summary: entry.querySelector('summary, content')?.textContent?.slice(0, 120),
      }))
  }

  return Array.from(doc.querySelectorAll('item'))
    .slice(0, limit)
    .map((item) => ({
      title: item.querySelector('title')?.textContent?.trim() ?? 'Item',
      link: item.querySelector('link')?.textContent?.trim(),
      date: item.querySelector('pubDate')?.textContent,
      summary: item.querySelector('description')?.textContent?.slice(0, 120),
    }))
}
