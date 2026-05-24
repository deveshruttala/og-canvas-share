import { isApiConfigured } from '@/lib/api'
import type { ShareSubject } from '@/lib/share-urls'
import { pingUrl } from '@/lib/share-urls'

export type PingKind = 'view' | 'embed' | 'reaction'

export async function recordPing(
  subject: ShareSubject,
  kind: PingKind = 'view',
  extra?: { emoji?: string; via?: string },
): Promise<void> {
  const url = pingUrl(subject)
  const body = {
    kind,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    ...extra,
  }

  if (isApiConfigured()) {
    try {
      await fetch(url.replace(window.location.origin, import.meta.env.VITE_API_URL ?? ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return
    } catch {
      /* noop — stats are best-effort */
    }
  }

  // Local-only: store counts in sessionStorage (privacy-preserving, no cookies)
  const key = `wall-stats:${subject.kind}:${subject.id}:${kind}`
  const n = Number(sessionStorage.getItem(key) ?? '0') + 1
  sessionStorage.setItem(key, String(n))
}

export function getLocalPingCount(subject: ShareSubject, kind: PingKind = 'view'): number {
  const key = `wall-stats:${subject.kind}:${subject.id}:${kind}`
  return Number(sessionStorage.getItem(key) ?? '0')
}

export type StatsSummary = {
  views: number
  embeds: number
  reactions: Record<string, number>
  hourly: { hour: string; views: number; embeds: number }[]
  topReferrers: { host: string; count: number }[]
}

export async function fetchStats(subject: ShareSubject): Promise<StatsSummary | null> {
  if (!isApiConfigured()) {
    const views = getLocalPingCount(subject, 'view')
    const embeds = getLocalPingCount(subject, 'embed')
    return { views, embeds, reactions: {}, hourly: [], topReferrers: [] }
  }

  const base =
    subject.kind === 'wall'
      ? `${import.meta.env.VITE_API_URL}/u/${subject.id}/stats`
      : `${import.meta.env.VITE_API_URL}/w/${subject.id}/stats`

  try {
    const token = localStorage.getItem('wall_auth_token')
    const res = await fetch(base, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return null
    return (await res.json()) as StatsSummary
  } catch {
    return null
  }
}
