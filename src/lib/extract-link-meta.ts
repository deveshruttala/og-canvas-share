export type LinkMeta = {
  title?: string
  description?: string
  image?: string
}

export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint)
    if (!res.ok) return {}
    const data = (await res.json()) as {
      data?: { title?: string; description?: string; image?: { url?: string } }
    }
    return {
      title: data.data?.title,
      description: data.data?.description,
      image: data.data?.image?.url,
    }
  } catch {
    return {}
  }
}
