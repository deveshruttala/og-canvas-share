import { describe, expect, it } from 'vitest'
import {
  classifyText,
  classifyUrl,
  isLikelyCode,
  routeClipboard,
  tryQuickChartFromText,
  normalizeCalEmbedUrl,
  buildQuickChartUrl,
} from '../src/paste/router'

describe('classifyUrl', () => {
  it('routes YouTube to embed', () => {
    expect(classifyUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ').kind).toBe('embed')
  })

  it('routes Spotify playlist to embed', () => {
    expect(classifyUrl('https://open.spotify.com/playlist/37i9dQZF1DX').kind).toBe('embed')
  })

  it('routes direct images to asset-image', () => {
    expect(classifyUrl('https://example.com/photo.jpg').kind).toBe('asset-image')
  })

  it('routes mp4 to asset-video', () => {
    expect(classifyUrl('https://cdn.example.com/clip.mp4').kind).toBe('asset-video')
  })

  it('routes RSS feeds', () => {
    expect(classifyUrl('https://letterboxd.com/user/rss/').kind).toBe('rss-feed')
    expect(classifyUrl('https://dev.to/feed/username').kind).toBe('rss-feed')
  })

  it('routes Cal.com to calendar embed', () => {
    expect(classifyUrl('https://cal.com/acme/30min').kind).toBe('calendar-embed')
  })

  it('routes quickchart URLs', () => {
    expect(classifyUrl('https://quickchart.io/chart?c=%7B%7D').kind).toBe('quickchart')
  })

  it('routes unknown URLs to link', () => {
    expect(classifyUrl('https://example.com/blog/post').kind).toBe('link')
  })

  it('routes YouTube homepage to link (not broken embed)', () => {
    expect(classifyUrl('https://www.youtube.com/').kind).toBe('link')
    expect(classifyUrl('https://www.youtube.com').kind).toBe('link')
  })

  it('routes Spotify homepage to link', () => {
    expect(classifyUrl('https://open.spotify.com/').kind).toBe('link')
  })
})

describe('classifyText', () => {
  it('detects fenced code as carbon-code', () => {
    const r = classifyText('```ts\nconst x = 1\n```')
    expect(r.kind).toBe('carbon-code')
    if (r.kind === 'carbon-code') expect(r.language).toBe('ts')
  })

  it('detects multiline code', () => {
    const code = 'import React from "react"\n\nexport function App() {\n  return null\n}'
    expect(classifyText(code).kind).toBe('carbon-code')
  })

  it('routes plain URLs via classifyUrl', () => {
    expect(classifyText('https://github.com/octocat').kind).toBe('link')
  })

  it('routes chart JSON to quickchart', () => {
    const json = JSON.stringify({
      type: 'bar',
      data: { labels: ['A'], datasets: [{ data: [1] }] },
    })
    expect(classifyText(json).kind).toBe('quickchart')
  })

  it('routes short prose to sticky', () => {
    expect(classifyText('Hello wall').kind).toBe('sticky')
  })
})

describe('routeClipboard', () => {
  it('prefers image file over text', () => {
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    const r = routeClipboard({ files: [file], text: 'https://example.com' })
    expect(r?.kind).toBe('image-file')
  })

  it('routes audio files', () => {
    const file = new File([new Uint8Array([1])], 'a.mp3', { type: 'audio/mpeg' })
    expect(routeClipboard({ files: [file] })?.kind).toBe('audio-file')
  })
})

describe('helpers', () => {
  it('isLikelyCode respects fences', () => {
    expect(isLikelyCode('```js\nx\n```')).toBe(true)
    expect(isLikelyCode('hello')).toBe(false)
  })

  it('buildQuickChartUrl encodes config', () => {
    const url = buildQuickChartUrl({ type: 'bar', data: {} })
    expect(url).toContain('quickchart.io')
    expect(url).toContain(encodeURIComponent('bar'))
  })

  it('normalizeCalEmbedUrl appends embed path', () => {
    expect(normalizeCalEmbedUrl('https://cal.com/acme/intro')).toContain('/embed')
  })

  it('tryQuickChartFromText parses chart json', () => {
    const url = tryQuickChartFromText('{"type":"line","data":{"labels":["x"],"datasets":[{"data":[1]}]}}')
    expect(url).toContain('quickchart.io')
  })
})

describe('classifyUrl embed platforms', () => {
  const embedUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://open.spotify.com/track/11dFghVXanMlKm8ei5T7',
    'https://vimeo.com/123456789',
    'https://soundcloud.com/artist/track-name',
  ]
  for (const url of embedUrls) {
    it(`embed: ${url}`, () => {
      expect(classifyUrl(url).kind).toBe('embed')
    })
  }
})

describe('classifyUrl assets', () => {
  it('png', () => expect(classifyUrl('https://cdn.example.com/a.png').kind).toBe('asset-image'))
  it('webp', () => expect(classifyUrl('https://cdn.example.com/a.webp').kind).toBe('asset-image'))
  it('mp4', () => expect(classifyUrl('https://cdn.example.com/a.mp4').kind).toBe('asset-video'))
  it('unsplash', () =>
    expect(classifyUrl('https://images.unsplash.com/photo-1').kind).toBe('asset-image'),
  )
})

describe('classifyText stickies', () => {
  it('long text', () => {
    const t = Array.from({ length: 30 }, () => 'word').join(' ')
    expect(classifyText(t).kind).toBe('sticky')
  })
  it('domain without scheme', () => {
    expect(classifyText('cal.com/acme/intro').kind).toBe('calendar-embed')
  })
})
