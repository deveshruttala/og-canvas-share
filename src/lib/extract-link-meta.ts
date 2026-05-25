export type LinkMeta = {
  title?: string
  description?: string
  image?: string
}

function fallbackTitle(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '').split('/').pop()
    return path ? decodeURIComponent(path.replace(/-/g, ' ')) : u.hostname.replace(/^www\./, '')
  } catch {
    return 'Link'
  }
}

export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  const fallback: LinkMeta = { title: fallbackTitle(url) }

  try {
    const endpoint = `/microlink-api/?url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint)
    if (!res.ok) return fallback
    const data = (await res.json()) as {
      data?: { title?: string; description?: string; image?: { url?: string } }
    }
    return {
      title: data.data?.title ?? fallback.title,
      description: data.data?.description,
      image: data.data?.image?.url,
    }
  } catch {
    return fallback
  }
}
