const APP_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://wall.app'

export type ShareSubject = { kind: 'wall'; id: string } | { kind: 'widget'; id: string }

export function shareBaseUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/u/${subject.id}` : `${origin}/w/${subject.id}`
}

export function versionedUrl(base: string, version: number, extra?: Record<string, string>): string {
  const u = new URL(base)
  u.searchParams.set('v', String(version))
  if (extra) {
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v)
  }
  return u.toString()
}

export function embedUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/embed/${subject.id}` : `${origin}/w/${subject.id}/embed`
}

export function pngUrl(subject: ShareSubject, opts?: { og?: boolean; fmt?: string; w?: number }, origin = APP_ORIGIN): string {
  const base = subject.kind === 'wall' ? `${origin}/u/${subject.id}.png` : `${origin}/w/${subject.id}.png`
  const u = new URL(base)
  if (opts?.og) u.searchParams.set('og', '1')
  if (opts?.fmt) u.searchParams.set('fmt', opts.fmt)
  if (opts?.w) u.searchParams.set('w', String(opts.w))
  return u.toString()
}

export function svgUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/u/${subject.id}.svg` : `${origin}/w/${subject.id}.svg`
}

export function jsonUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/u/${subject.id}.json` : `${origin}/w/${subject.id}.json`
}

export function sseUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/u/${subject.id}/events` : `${origin}/w/${subject.id}/events`
}

export function wallliveUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall'
    ? `${origin}/u/${subject.id}/.well-known/walllive`
    : `${origin}/w/${subject.id}/.well-known/walllive`
}

export function pingUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return subject.kind === 'wall' ? `${origin}/u/${subject.id}/ping` : `${origin}/w/${subject.id}/ping`
}

export function rssUrl(username: string, origin = APP_ORIGIN): string {
  return `${origin}/u/${username}/feed.xml`
}

export function linkedInInspectorUrl(url: string): string {
  return `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`
}

export function linkedInShareIntent(url: string, text?: string): string {
  const u = new URL('https://www.linkedin.com/sharing/share-offsite/')
  u.searchParams.set('url', url)
  if (text) u.searchParams.set('text', text)
  return u.toString()
}

export function shortUrl(subject: ShareSubject, origin = APP_ORIGIN): string {
  return shareBaseUrl(subject, origin)
}
