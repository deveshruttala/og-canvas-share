/** Text box / sticky styling — maps to tldraw text & note shape props. */

export type WallTextDisplayMode = 'plain' | 'card' | 'sticky'

export type WallStickyColor =
  | 'yellow'
  | 'light-green'
  | 'light-blue'
  | 'light-violet'
  | 'light-red'
  | 'orange'

/** All default tldraw label/text colors. */
export type WallTextColor =
  | 'black'
  | 'grey'
  | 'white'
  | 'red'
  | 'light-red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'light-green'
  | 'blue'
  | 'light-blue'
  | 'violet'
  | 'light-violet'

export type WallTextFont = 'sans' | 'draw' | 'serif' | 'mono'
/** Wall UI sizes — mapped to tldraw s/m/l/xl + optional scale. */
export type WallTextSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl'
export type TldrawTextSize = 's' | 'm' | 'l' | 'xl'
export type WallTextAlign = 'start' | 'middle' | 'end'

export type WallTextBoxStyle = {
  mode: WallTextDisplayMode
  font: WallTextFont
  size: WallTextSize
  color: WallTextColor
  textAlign: WallTextAlign
  stickyColor: WallStickyColor
  cardBg: string
  /** Fine size tuning beyond tldraw presets (default 1). */
  textScale?: number
}

export const DEFAULT_TEXT_BOX_STYLE: WallTextBoxStyle = {
  mode: 'plain',
  font: 'sans',
  size: 'm',
  color: 'black',
  textAlign: 'start',
  stickyColor: 'yellow',
  cardBg: '#ffffff',
}

export const STICKY_COLOR_HEX: Record<WallStickyColor, string> = {
  yellow: '#fef08a',
  'light-green': '#bbf7d0',
  'light-blue': '#bfdbfe',
  'light-violet': '#ddd6fe',
  'light-red': '#fecaca',
  orange: '#fed7aa',
}

/** Hex swatches for inspector color chips (tldraw theme approximations). */
export const TEXT_COLOR_SWATCH: Record<WallTextColor, string> = {
  black: '#1a1814',
  grey: '#94a3b8',
  white: '#ffffff',
  red: '#ef4444',
  'light-red': '#fca5a5',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  'light-green': '#86efac',
  blue: '#3b82f6',
  'light-blue': '#93c5fd',
  violet: '#8b5cf6',
  'light-violet': '#c4b5fd',
}

export const TEXT_COLOR_OPTIONS: { id: WallTextColor; label: string }[] = [
  { id: 'black', label: 'Black' },
  { id: 'grey', label: 'Grey' },
  { id: 'white', label: 'White' },
  { id: 'red', label: 'Red' },
  { id: 'light-red', label: 'Soft red' },
  { id: 'orange', label: 'Orange' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'light-green', label: 'Mint' },
  { id: 'blue', label: 'Blue' },
  { id: 'light-blue', label: 'Sky' },
  { id: 'violet', label: 'Violet' },
  { id: 'light-violet', label: 'Lavender' },
]

export const FONT_OPTIONS: { id: WallTextFont; label: string; hint: string; sample: string }[] = [
  { id: 'sans', label: 'Sans', hint: 'Inter-style UI', sample: 'Aa' },
  { id: 'draw', label: 'Hand', hint: 'Sketch marker', sample: 'Aa' },
  { id: 'serif', label: 'Serif', hint: 'Editorial', sample: 'Aa' },
  { id: 'mono', label: 'Mono', hint: 'Code & data', sample: 'Aa' },
]

export const SIZE_OPTIONS: { id: WallTextSize; label: string; hint: string; px: number }[] = [
  { id: 'xs', label: 'XS', hint: 'Fine print', px: 12 },
  { id: 's', label: 'S', hint: 'Caption', px: 14 },
  { id: 'm', label: 'M', hint: 'Body', px: 18 },
  { id: 'l', label: 'L', hint: 'Subheading', px: 24 },
  { id: 'xl', label: 'XL', hint: 'Heading', px: 32 },
  { id: '2xl', label: '2XL', hint: 'Display', px: 42 },
  { id: '3xl', label: '3XL', hint: 'Hero', px: 56 },
]

/** Maps Wall sizes to tldraw props. */
export function resolveTextSizeProps(size: WallTextSize): { size: TldrawTextSize; scale: number } {
  const map: Record<WallTextSize, { size: TldrawTextSize; scale: number }> = {
    xs: { size: 's', scale: 0.72 },
    s: { size: 's', scale: 1 },
    m: { size: 'm', scale: 1 },
    l: { size: 'l', scale: 1 },
    xl: { size: 'xl', scale: 1 },
    '2xl': { size: 'xl', scale: 1.38 },
    '3xl': { size: 'xl', scale: 1.85 },
  }
  return map[size] ?? map.m
}

export function wallSizeFromShape(size: TldrawTextSize, scale: number): WallTextSize {
  if (size === 's' && scale < 0.85) return 'xs'
  if (size === 'xl' && scale >= 1.65) return '3xl'
  if (size === 'xl' && scale >= 1.2) return '2xl'
  return size as WallTextSize
}

export const TEXT_ALIGN_OPTIONS: { id: WallTextAlign; label: string }[] = [
  { id: 'start', label: 'Left' },
  { id: 'middle', label: 'Center' },
  { id: 'end', label: 'Right' },
]

export const CARD_BG_PRESETS: { id: string; label: string; css: string }[] = [
  { id: 'white', label: 'White', css: '#ffffff' },
  { id: 'cream', label: 'Cream', css: '#fffef5' },
  { id: 'linen', label: 'Linen', css: '#faf6f0' },
  { id: 'sand', label: 'Sand', css: '#f5f0e6' },
  { id: 'mint', label: 'Mint', css: '#ecfdf5' },
  { id: 'sky', label: 'Sky', css: '#eff6ff' },
  { id: 'ice', label: 'Ice', css: '#f0fdfa' },
  { id: 'blush', label: 'Blush', css: '#fff1f2' },
  { id: 'peach', label: 'Peach', css: '#fff7ed' },
  { id: 'lavender', label: 'Lavender', css: '#f5f3ff' },
  { id: 'lilac', label: 'Lilac', css: '#ede9fe' },
  { id: 'lemon', label: 'Lemon', css: '#fefce8' },
  { id: 'lime-tint', label: 'Lime tint', css: '#f7fee7' },
  { id: 'slate', label: 'Slate', css: '#1e293b' },
  { id: 'charcoal', label: 'Charcoal', css: '#0f172a' },
  { id: 'ink', label: 'Ink', css: '#18181b' },
  { id: 'glass', label: 'Glass', css: 'rgba(255,255,255,0.88)' },
  { id: 'frost', label: 'Frost', css: 'rgba(255,255,255,0.55)' },
  { id: 'smoke', label: 'Smoke', css: 'rgba(15,23,42,0.75)' },
  { id: 'neon', label: 'Neon lime', css: 'rgba(190,238,29,0.2)' },
  { id: 'neon-pink', label: 'Neon pink', css: 'rgba(236,72,153,0.15)' },
  { id: 'gradient-sunset', label: 'Sunset', css: 'linear-gradient(135deg,#fff7ed,#fecdd3,#ddd6fe)' },
  { id: 'gradient-ocean', label: 'Ocean', css: 'linear-gradient(135deg,#ecfeff,#dbeafe,#e0e7ff)' },
  { id: 'gradient-forest', label: 'Forest', css: 'linear-gradient(135deg,#ecfdf5,#bbf7d0,#86efac)' },
  { id: 'gradient-dark', label: 'Dark fade', css: 'linear-gradient(160deg,#1e293b,#0f172a)' },
  { id: 'gradient-aurora', label: 'Aurora', css: 'linear-gradient(120deg,#0f172a,#6366f1,#22d3ee,#beee1d)' },
  { id: 'gradient-warm', label: 'Warm glow', css: 'linear-gradient(135deg,#fef3c7,#fdba74,#f97316)' },
  { id: 'pattern-dots', label: 'Dot paper', css: 'radial-gradient(circle,#cbd5e1 1px,transparent 1px),#fff' },
]

/** One-click text looks (font + size + color + alignment). */
export const TEXT_STYLE_PRESETS: {
  id: string
  label: string
  style: Partial<WallTextBoxStyle>
}[] = [
  { id: 'title', label: 'Title', style: { font: 'sans', size: 'xl', color: 'black', textAlign: 'start' } },
  { id: 'subtitle', label: 'Subtitle', style: { font: 'sans', size: 'l', color: 'grey', textAlign: 'start' } },
  { id: 'body', label: 'Body', style: { font: 'sans', size: 'm', color: 'black', textAlign: 'start' } },
  { id: 'caption', label: 'Caption', style: { font: 'sans', size: 's', color: 'grey', textAlign: 'middle' } },
  { id: 'hand-note', label: 'Hand note', style: { font: 'draw', size: 'm', color: 'black', textAlign: 'start' } },
  { id: 'hand-title', label: 'Hand title', style: { font: 'draw', size: 'xl', color: 'black', textAlign: 'middle' } },
  { id: 'editorial', label: 'Editorial', style: { font: 'serif', size: 'l', color: 'black', textAlign: 'start' } },
  { id: 'quote', label: 'Quote', style: { font: 'serif', size: 'm', color: 'violet', textAlign: 'middle' } },
  { id: 'code', label: 'Code', style: { font: 'mono', size: 's', color: 'green', textAlign: 'start' } },
  { id: 'neon', label: 'Neon', style: { font: 'sans', size: 'l', color: 'light-green', textAlign: 'middle' } },
  { id: 'warning', label: 'Warning', style: { font: 'sans', size: 'm', color: 'orange', textAlign: 'start' } },
  { id: 'link-style', label: 'Link', style: { font: 'sans', size: 'm', color: 'blue', textAlign: 'start' } },
  { id: 'center-hero', label: 'Hero', style: { font: 'sans', size: 'xl', color: 'white', textAlign: 'middle' } },
  { id: 'soft-pink', label: 'Soft', style: { font: 'draw', size: 'm', color: 'light-red', textAlign: 'start' } },
  { id: 'mega', label: 'Mega', style: { font: 'sans', size: '3xl', color: 'black', textAlign: 'middle' } },
  { id: 'label', label: 'Label', style: { font: 'sans', size: 'xs', color: 'grey', textAlign: 'start' } },
  { id: 'display', label: 'Display', style: { font: 'serif', size: '2xl', color: 'black', textAlign: 'start' } },
  { id: 'marker', label: 'Marker', style: { font: 'draw', size: 'l', color: 'orange', textAlign: 'start' } },
  { id: 'sky', label: 'Sky', style: { font: 'sans', size: 'm', color: 'light-blue', textAlign: 'middle' } },
  { id: 'mint', label: 'Mint', style: { font: 'mono', size: 's', color: 'green', textAlign: 'start' } },
]

export const DISPLAY_MODE_OPTIONS: { id: WallTextDisplayMode; label: string; short: string }[] = [
  { id: 'plain', label: 'Plain text', short: 'Plain' },
  { id: 'card', label: 'Card', short: 'Card' },
  { id: 'sticky', label: 'Sticky note', short: 'Sticky' },
]

export function readWallTextBoxStyle(meta: Record<string, unknown> | undefined): WallTextBoxStyle {
  const raw = meta?.wallTextBox as Partial<WallTextBoxStyle> | undefined
  const merged = { ...DEFAULT_TEXT_BOX_STYLE, ...raw }
  if (raw?.size && !SIZE_OPTIONS.some((o) => o.id === raw.size)) {
    merged.size = 'm'
  }
  return merged
}

export function normalizeWallTextStyleFromShape(
  meta: Record<string, unknown> | undefined,
  shapeProps?: { size?: string; scale?: number },
): WallTextBoxStyle {
  const base = readWallTextBoxStyle(meta)
  if (shapeProps?.size && ['s', 'm', 'l', 'xl'].includes(shapeProps.size)) {
    const scale = shapeProps.scale ?? 1
    return {
      ...base,
      size: wallSizeFromShape(shapeProps.size as TldrawTextSize, scale),
      textScale: scale,
    }
  }
  return base
}
