import { nanoid } from 'nanoid'

export const CANVAS_WIDTH = 1600
export const CANVAS_HEIGHT = 1000
export const GRID_SIZE = 16

export type ThemeId =
  | 'corkboard'
  | 'whiteboard'
  | 'glass'
  | 'fridge'
  | 'locker'
  | 'notebook'
  | 'black'
  | 'white'

export type ElementType =
  | 'text'
  | 'image'
  | 'link'
  | 'embed'
  | 'video'
  | 'audio'
  | 'drawing'
  | 'qr'
  | 'emoji'
  | 'widget'

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg'

export type ElementStyle = {
  bg?: string
  color?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  borderRadius?: number
  shadow?: ShadowSize
  border?: string
}

export type TextContent = {
  text: string
}

export type ImageContent = {
  src: string
  alt?: string
}

export type LinkContent = {
  url: string
  title?: string
  description?: string
  image?: string
}

export type ElementContent = TextContent | ImageContent | LinkContent | Record<string, unknown>

export type LinkTo = {
  url: string
  label?: string
  openInNewTab?: boolean
}

export type CanvasElement = {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  rotation: number
  z: number
  locked?: boolean
  appearAt?: string
  disappearAt?: string
  linkTo?: LinkTo
  content: ElementContent
  style: ElementStyle
}

export type CanvasDoc = {
  version: 1
  id: string
  title: string
  theme: ThemeId
  accent: string
  width: typeof CANVAS_WIDTH
  height: typeof CANVAS_HEIGHT
  elements: CanvasElement[]
  reactions: Record<string, number>
  /** tldraw document snapshot (preferred persistence format) */
  snapshot?: unknown
  meta: {
    createdAt: string
    updatedAt: string
    ownerGithub: string
    shareVersion?: number
    showPublicStats?: boolean
  }
}

export function createEmptyCanvas(id = 'local'): CanvasDoc {
  const now = new Date().toISOString()
  return {
    version: 1,
    id,
    title: 'My Wall',
    theme: 'corkboard',
    accent: '#e8a838',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    elements: [],
    reactions: {},
    meta: {
      createdAt: now,
      updatedAt: now,
      ownerGithub: '',
    },
  }
}

export function createTextElement(
  x: number,
  y: number,
  text = 'Double-click to edit',
): CanvasElement {
  return {
    id: nanoid(),
    type: 'text',
    x,
    y,
    w: 220,
    h: 160,
    rotation: -1 + Math.random() * 2,
    z: Date.now(),
    content: { text },
    style: {
      bg: 'var(--sticky-yellow, #ffe89a)',
      color: '#1a1814',
      fontSize: 16,
      fontWeight: 500,
      borderRadius: 4,
      shadow: 'md',
    },
  }
}

export function createImageElement(x: number, y: number, src: string, alt = ''): CanvasElement {
  return {
    id: nanoid(),
    type: 'image',
    x,
    y,
    w: 280,
    h: 200,
    rotation: 0,
    z: Date.now(),
    content: { src, alt },
    style: {
      borderRadius: 8,
      shadow: 'md',
    },
  }
}

export type EmbedContent = {
  url: string
  embedUrl: string
  platform: string
}

export type AudioContent = {
  src: string
  title?: string
  artist?: string
}

export type EmojiContent = {
  emoji: string
}

export type QrContent = {
  url: string
}

export type WidgetContent = {
  type: 'clock' | 'weather' | 'spotify' | 'github'
  label?: string
  location?: string
  repo?: string
}

export function createEmojiElement(x: number, y: number, emoji: string): CanvasElement {
  return {
    id: nanoid(),
    type: 'emoji',
    x,
    y,
    w: 96,
    h: 96,
    rotation: -8 + Math.random() * 16,
    z: Date.now(),
    content: { emoji },
    style: { fontSize: 64, shadow: 'none' },
  }
}

export function createAudioElement(
  x: number,
  y: number,
  src: string,
  title = 'Audio track',
  artist?: string,
): CanvasElement {
  return {
    id: nanoid(),
    type: 'audio',
    x,
    y,
    w: 320,
    h: 120,
    rotation: 0,
    z: Date.now(),
    content: { src, title, artist },
    style: {
      bg: '#1a1814',
      color: '#faf8f5',
      borderRadius: 12,
      shadow: 'md',
    },
  }
}

export function createEmbedElement(
  x: number,
  y: number,
  url: string,
  embedUrl: string,
  platform: string,
): CanvasElement {
  return {
    id: nanoid(),
    type: 'embed',
    x,
    y,
    w: 400,
    h: platform === 'spotify' ? 152 : 260,
    rotation: 0,
    z: Date.now(),
    content: { url, embedUrl, platform },
    style: { borderRadius: 12, shadow: 'md' },
  }
}

export function createQrElement(x: number, y: number, url: string): CanvasElement {
  return {
    id: nanoid(),
    type: 'qr',
    x,
    y,
    w: 180,
    h: 200,
    rotation: 0,
    z: Date.now(),
    content: { url },
    style: { bg: '#ffffff', borderRadius: 8, shadow: 'md' },
  }
}

export function createWidgetElement(
  x: number,
  y: number,
  widget: WidgetContent,
): CanvasElement {
  const sizes: Record<WidgetContent['type'], { w: number; h: number }> = {
    clock: { w: 280, h: 140 },
    weather: { w: 300, h: 160 },
    spotify: { w: 360, h: 200 },
    github: { w: 380, h: 240 },
  }
  const { w, h } = sizes[widget.type]
  return {
    id: nanoid(),
    type: 'widget',
    x,
    y,
    w,
    h,
    rotation: 0,
    z: Date.now(),
    content: widget,
    style: {
      bg: '#24211c',
      color: '#faf8f5',
      borderRadius: 12,
      shadow: 'md',
    },
  }
}

export function createLinkElement(
  x: number,
  y: number,
  url: string,
  meta?: Partial<LinkContent>,
): CanvasElement {
  let hostname = url
  try {
    hostname = new URL(url).hostname
  } catch {
    /* keep raw url */
  }
  return {
    id: nanoid(),
    type: 'link',
    x,
    y,
    w: 300,
    h: 120,
    rotation: 0,
    z: Date.now(),
    content: {
      url,
      title: meta?.title ?? hostname,
      description: meta?.description,
      image: meta?.image,
    },
    style: {
      bg: '#ffffff',
      color: '#1c1917',
      borderRadius: 12,
      shadow: 'md',
    },
  }
}
