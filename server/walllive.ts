type WallliveSubject = {
  kind: 'wall' | 'widget'
  id: string
  title?: string
  owner?: string
  updatedAt?: string
  etag?: string
}

const ORIGIN = Deno.env.get('PUBLIC_ORIGIN') ?? Deno.env.get('FRONTEND_ORIGIN') ?? 'https://wall.app'

function basePath(subject: WallliveSubject): string {
  return subject.kind === 'wall' ? `/u/${subject.id}` : `/w/${subject.id}`
}

export function buildWallliveDoc(subject: WallliveSubject) {
  const base = `${ORIGIN}${basePath(subject)}`
  const title = subject.title ?? (subject.kind === 'wall' ? `${subject.id}'s wall` : subject.id)
  const etag = subject.etag ?? `v1-${subject.updatedAt ?? '0'}`

  return {
    version: '1.0',
    subject: {
      kind: subject.kind,
      id: subject.id,
      title,
      owner: subject.owner ?? subject.id,
      updatedAt: subject.updatedAt ?? new Date().toISOString(),
    },
    renders: {
      image_png: `${base}.png`,
      image_svg: `${base}.svg`,
      embed_html: subject.kind === 'wall' ? `${ORIGIN}/embed/${subject.id}` : `${base}/embed`,
      data_json: `${base}.json`,
    },
    streams: {
      sse: `${base}/events`,
      websocket: null,
    },
    actions: subject.kind === 'wall'
      ? { react: { method: 'POST', url: `${base}/react` } }
      : {},
    etag,
    cache: { maxAgeSec: 60, staleWhileRevalidateSec: 300 },
  }
}
