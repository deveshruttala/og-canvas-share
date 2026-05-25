import type { OmniItem } from '@/providers/types'

const MAX_BYTES = 12_000_000
const METADATA_TIMEOUT_MS = 4500

type IaDoc = { identifier: string; title: string }

async function fetchIaMp3(identifier: string): Promise<{ name: string; size: number } | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), METADATA_TIMEOUT_MS)
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`, { signal: ctrl.signal })
    if (!res.ok) return null
    const data = (await res.json()) as { files?: { name?: string; format?: string; size?: string }[] }
    const files = data.files ?? []
    const mp3 = files
      .filter((f) => {
        const name = f.name ?? ''
        const size = Number(f.size ?? 0)
        return name.toLowerCase().endsWith('.mp3') && size > 0 && size < MAX_BYTES
      })
      .sort((a, b) => Number(a.size ?? 0) - Number(b.size ?? 0))[0]
    if (!mp3?.name) return null
    return { name: mp3.name, size: Number(mp3.size ?? 0) }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function searchInternetArchiveAudio(query: string, limit = 6): Promise<OmniItem[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: `${q} AND mediatype:audio`,
      'fl[]': 'identifier,title',
      rows: String(Math.min(limit * 2, 12)),
      output: 'json',
    })
    const res = await fetch(`https://archive.org/advancedsearch.php?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as { response?: { docs?: IaDoc[] } }
    const docs = data.response?.docs ?? []
    if (!docs.length) return []

    const settled = await Promise.all(
      docs.slice(0, limit * 2).map(async (doc) => {
        const file = await fetchIaMp3(doc.identifier)
        if (!file) return null
        const src = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(file.name)}`
        return {
          id: `ia-${doc.identifier}`,
          kind: 'audio' as const,
          title: doc.title?.slice(0, 80) ?? 'Archive track',
          subtitle: 'Internet Archive',
          previewUrl: src,
          duration: Math.min(600, Math.round(file.size / 16000)),
          source: 'Archive',
          payload: {
            src,
            title: doc.title,
            artist: 'Internet Archive',
            badge: 'Archive',
          },
        } satisfies OmniItem
      }),
    )

    return settled.filter((x) => x != null).slice(0, limit)
  } catch {
    return []
  }
}
