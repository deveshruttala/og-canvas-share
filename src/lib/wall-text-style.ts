export type WallTextDisplayMode = 'plain' | 'card' | 'sticky'

export type WallStickyColor =
  | 'yellow'
  | 'light-green'
  | 'light-blue'
  | 'light-violet'
  | 'light-red'
  | 'orange'

export type WallTextFont = 'sans' | 'draw' | 'serif' | 'mono'
export type WallTextSize = 's' | 'm' | 'l' | 'xl'
export type WallTextColor = 'black' | 'grey' | 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet'

export type WallTextBoxStyle = {
  mode: WallTextDisplayMode
  font: WallTextFont
  size: WallTextSize
  color: WallTextColor
  stickyColor: WallStickyColor
  cardBg: string
}

export const DEFAULT_TEXT_BOX_STYLE: WallTextBoxStyle = {
  mode: 'plain',
  font: 'sans',
  size: 'm',
  color: 'black',
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

export const TEXT_COLOR_OPTIONS: { id: WallTextColor; label: string }[] = [
  { id: 'black', label: 'Black' },
  { id: 'grey', label: 'Grey' },
  { id: 'white', label: 'White' },
  { id: 'red', label: 'Red' },
  { id: 'orange', label: 'Orange' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'violet', label: 'Violet' },
]

export const FONT_OPTIONS: { id: WallTextFont; label: string }[] = [
  { id: 'sans', label: 'Sans' },
  { id: 'draw', label: 'Hand' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
]

export const SIZE_OPTIONS: { id: WallTextSize; label: string }[] = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' },
]

export const CARD_BG_PRESETS: { id: string; label: string; css: string }[] = [
  { id: 'white', label: 'White', css: '#ffffff' },
  { id: 'cream', label: 'Cream', css: '#fffef5' },
  { id: 'slate', label: 'Slate', css: '#1e293b' },
  { id: 'glass', label: 'Glass', css: 'rgba(255,255,255,0.85)' },
]

export function readWallTextBoxStyle(meta: Record<string, unknown> | undefined): WallTextBoxStyle {
  const raw = meta?.wallTextBox as Partial<WallTextBoxStyle> | undefined
  return { ...DEFAULT_TEXT_BOX_STYLE, ...raw }
}
