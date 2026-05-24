/** Placeholder live render — SVG card with wall/widget metadata. */

type RenderOpts = {
  title: string
  subtitle?: string
  accent?: string
  fmt?: string
  og?: boolean
}

const SIZES: Record<string, { w: number; h: number }> = {
  default: { w: 1600, h: 1000 },
  og: { w: 1200, h: 630 },
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  thumb: { w: 800, h: 800 },
}

export function renderSvg(opts: RenderOpts & { w: number; h: number }): string {
  const { title, subtitle, accent = '#beee1d', w, h } = opts
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" rx="24" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="${w / 2}" y="${h / 2 - 20}" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="${Math.round(w / 28)}" font-weight="800">${escapeXml(title)}</text>
  ${subtitle ? `<text x="${w / 2}" y="${h / 2 + 40}" text-anchor="middle" fill="#a3a3a3" font-family="system-ui,sans-serif" font-size="${Math.round(w / 40)}">${escapeXml(subtitle)}</text>` : ''}
  <text x="${w / 2}" y="${h - 48}" text-anchor="middle" fill="#525252" font-family="ui-monospace,monospace" font-size="14">wall.app · live</text>
</svg>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function resolveRenderSize(url: URL): { w: number; h: number } {
  if (url.searchParams.get('og') === '1') return SIZES.og
  const fmt = url.searchParams.get('fmt')
  if (fmt && SIZES[fmt]) return SIZES[fmt]!
  const w = Number(url.searchParams.get('w'))
  if (w > 0) return { w, h: Math.round(w * 0.625) }
  return SIZES.default
}

export function renderResponse(url: URL, title: string, subtitle?: string, fmt: 'svg' | 'png' = 'svg'): Response {
  const size = resolveRenderSize(url)
  const svg = renderSvg({ title, subtitle, w: size.w, h: size.h, og: url.searchParams.get('og') === '1' })

  if (fmt === 'svg') {
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  }

  // PNG: return SVG with image/svg+xml — browsers/scrapers often accept; full PNG rasterization ships server-side later
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'X-Wall-Render-Format': 'svg-fallback',
    },
  })
}
