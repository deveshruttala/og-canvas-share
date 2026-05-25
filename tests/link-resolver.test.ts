import { describe, expect, it } from 'vitest'
import {
  extractYoutubeVideoId,
  getEmbedUrl,
  detectLinkPlatform,
  isEmbeddableUrl,
} from '../src/lib/link-resolver'

describe('extractYoutubeVideoId', () => {
  it('parses watch URLs', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('parses youtu.be', () => {
    expect(extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('parses shorts', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/shorts/abc123XYZ01')).toBe('abc123XYZ01')
  })
  it('rejects homepage', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/')).toBeNull()
  })
})

describe('isEmbeddableUrl', () => {
  it('allows track URLs', () => {
    expect(isEmbeddableUrl('https://open.spotify.com/track/11dFghVXanMlKm8ei5T7')).toBe(true)
  })
  it('rejects bare homepages', () => {
    expect(isEmbeddableUrl('https://www.youtube.com/')).toBe(false)
    expect(isEmbeddableUrl('https://open.spotify.com/')).toBe(false)
  })
  it('builds youtube embed', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    expect(getEmbedUrl(url, detectLinkPlatform(url))).toContain('/embed/dQw4w9WgXcQ')
  })
})
