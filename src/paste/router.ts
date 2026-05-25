/**
 * Paste-time routing — inspect clipboard once, pick the right wall element.
 * Discovery stays in OmniBar tabs; paste expresses intent.
 */
import { canNativeEmbed } from '@/lib/oembed'

export type PasteRoute =
  | { kind: 'image-file'; file: File }
  | { kind: 'audio-file'; file: File }
  | { kind: 'embed'; url: string }
  | { kind: 'asset-image'; url: string }
  | { kind: 'asset-video'; url: string }
  | { kind: 'rss-feed'; feedUrl: string }
  | { kind: 'calendar-embed'; url: string }
  | { kind: 'carbon-code'; code: string; language?: string }
  | { kind: 'quickchart'; chartUrl: string }
  | { kind: 'link'; url: string }
  | { kind: 'html'; html: string; plain: string }
  | { kind: 'code'; text: string; language?: string }
  | { kind: 'sticky'; text: string }

export type ClipboardSlice = {
  text?: string
  html?: string
  files: File[]
}

const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|$)/i
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i

const RSS_HINT =
  /(\.rss$|\/rss(\/|$)|\/feed(\/|$)|\/atom(\/|$)|feeds\/|\.xml\?|format=rss)/i

const CAL_HOST = /^(?:https?:\/\/)?(?:www\.)?cal\.com\//i
const CAL_EMBED_HOST = /cal\.com\/[^/]+\/embed/i

const DIRECT_IMAGE_HOST =
  /(?:images\.unsplash\.com|i\.imgur\.com|pbs\.twimg\.com|cdn\.|cloudinary\.com|wikimedia\.org\/wiki\/Special:FilePath)/i

const DIRECT_VIDEO_HOST = /(?:coverr\.co|pexels\.com\/video|vimeo\.com\/external)/i

export function extractClipboardFiles(items: DataTransferItemList | undefined): File[] {
  if (!items) return []
  const files: File[] = []
  for (const item of items) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (file) files.push(file)
  }
  return files
}

export function readClipboardSlice(data: DataTransfer | null | undefined): ClipboardSlice {
  if (!data) return { files: [] }
  return {
    text: data.getData('text/plain')?.trim() || undefined,
    html: data.getData('text/html')?.trim() || undefined,
    files: extractClipboardFiles(data.items),
  }
}

export function isLikelyCode(text: string): boolean {
  const t = text.trim()
  if (t.length < 8) return false
  const fence = t.match(/^```(\w+)?\n?([\s\S]*)```$/m)
  if (fence) return true
  if (!t.includes('\n')) return false
  return /^(import |export |const |let |function |class |interface |type |def |#include|package |public static|<?php|<!DOCTYPE)/m.test(
    t,
  )
}

export function unwrapCodeFence(text: string): { code: string; language?: string } {
  const m = text.trim().match(/^```(\w+)?\n?([\s\S]*)```$/m)
  if (m) return { language: m[1], code: (m[2] ?? '').trim() }
  return { code: text.trim() }
}

export function isQuickChartUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes('quickchart.io')
  } catch {
    return false
  }
}

export function buildQuickChartUrl(config: Record<string, unknown>): string {
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=500&h=300&bkg=%230d0e12`
}

/** If plain text is JSON chart config, return a QuickChart image URL. */
export function tryQuickChartFromText(text: string): string | null {
  const t = text.trim()
  if (!t.startsWith('{') || !t.includes('"type"')) return null
  try {
    const config = JSON.parse(t) as Record<string, unknown>
    if (typeof config.type === 'string') return buildQuickChartUrl(config)
  } catch {
    /* not chart json */
  }
  return null
}

export function classifyUrl(url: string): PasteRoute {
  const normalized = /^https?:\/\//i.test(url) ? url.trim() : `https://${url.trim()}`

  if (CAL_HOST.test(normalized) || CAL_EMBED_HOST.test(normalized)) {
    return { kind: 'calendar-embed', url: normalized }
  }

  if (RSS_HINT.test(normalized) || /youtube\.com\/feeds\//i.test(normalized)) {
    return { kind: 'rss-feed', feedUrl: normalized }
  }

  if (isQuickChartUrl(normalized)) {
    return { kind: 'quickchart', chartUrl: normalized }
  }

  if (VIDEO_EXT.test(normalized) || DIRECT_VIDEO_HOST.test(normalized)) {
    return { kind: 'asset-video', url: normalized }
  }

  if (IMAGE_EXT.test(normalized) || DIRECT_IMAGE_HOST.test(normalized)) {
    return { kind: 'asset-image', url: normalized }
  }

  if (canNativeEmbed(normalized)) {
    return { kind: 'embed', url: normalized }
  }

  if (AUDIO_EXT.test(normalized)) {
    return { kind: 'link', url: normalized }
  }

  return { kind: 'link', url: normalized }
}

export function classifyText(text: string): PasteRoute {
  const chartUrl = tryQuickChartFromText(text)
  if (chartUrl) return { kind: 'quickchart', chartUrl }

  if (isLikelyCode(text)) {
    const { code, language } = unwrapCodeFence(text)
    return { kind: 'carbon-code', code, language }
  }

  const urlMatch = text.match(/^https?:\/\/\S+$/i)
  if (urlMatch) return classifyUrl(urlMatch[0]!)

  const domainLike = text.match(/^[\w-]+\.[\w.-]+(?:\/\S*)?$/)
  if (domainLike && !text.includes(' ')) {
    return classifyUrl(text)
  }

  if (text.length > 240 || text.split('\n').length > 6) {
    return { kind: 'sticky', text }
  }

  return { kind: 'sticky', text }
}

/** Synchronous route from clipboard (URL embed resolution happens in execute). */
export function routeClipboard(slice: ClipboardSlice): PasteRoute | null {
  for (const file of slice.files) {
    if (file.type.startsWith('image/')) return { kind: 'image-file', file }
    if (file.type.startsWith('audio/')) return { kind: 'audio-file', file }
  }

  if (slice.html && slice.html.length > 20 && !slice.text?.startsWith('http')) {
    const plain = slice.text ?? stripHtml(slice.html)
    if (plain) return { kind: 'html', html: slice.html, plain }
  }

  if (slice.text) return classifyText(slice.text)
  return null
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.trim() ?? ''
}

export function normalizeCalEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.replace(/^www\./, '') !== 'cal.com') return url
    if (u.pathname.endsWith('/embed')) return url
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length >= 1) {
      return `https://cal.com/${parts.join('/')}/embed`
    }
  } catch {
    /* keep */
  }
  return url
}
