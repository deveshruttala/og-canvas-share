export function buildRssFeed(username: string, wall: { title?: string; meta?: { updatedAt?: string }; elements?: unknown[] }) {
  const origin = Deno.env.get('PUBLIC_ORIGIN') ?? Deno.env.get('FRONTEND_ORIGIN') ?? 'https://wall.app'
  const title = wall.title ?? `${username}'s Wall`
  const updated = wall.meta?.updatedAt ?? new Date().toISOString()
  const elements = (wall.elements ?? []) as Array<{ id?: string; type?: string; content?: Record<string, unknown> }>

  const items = elements.slice(-20).map((el, i) => {
    const label = el.type ?? 'element'
    const desc = JSON.stringify(el.content ?? {}).slice(0, 200)
    return `    <item>
      <title>${escapeXml(`${label} on ${title}`)}</title>
      <link>${origin}/u/${username}#${el.id ?? i}</link>
      <guid isPermaLink="false">${username}-${el.id ?? i}</guid>
      <pubDate>${new Date(updated).toUTCString()}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${origin}/u/${username}</link>
    <description>Live wall updates from ${escapeXml(username)}</description>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
