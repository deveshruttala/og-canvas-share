export type WidgetThemeRadius = 'sm' | 'md' | 'lg'
export type WidgetThemeShadow = 'none' | 'soft' | 'lifted'
export type WidgetThemeFont = 'inter' | 'serif' | 'mono' | 'handwritten'

export type WidgetTheme = {
  background: string
  surface: string
  text: string
  accent: string
  radius: WidgetThemeRadius
  shadow: WidgetThemeShadow
  font: WidgetThemeFont
}

export type WidgetVisibility = 'public' | 'unlisted' | 'private'

export type WidgetInstance = {
  id: string
  ownerId: string
  ownerUsername?: string
  widgetId: string
  name?: string
  config: Record<string, unknown>
  size: { w: number; h: number }
  theme: WidgetTheme
  visibility: WidgetVisibility
  wallElementId?: string
  wallUsername?: string
  createdAt: string
  updatedAt: string
  views: number
  shareVersion?: number
}

export const DEFAULT_WIDGET_THEME: WidgetTheme = {
  background: '#0a0a0f',
  surface: '#0d0e12',
  text: '#fafafa',
  accent: '#beee1d',
  radius: 'lg',
  shadow: 'lifted',
  font: 'mono',
}

export const WIDGET_RADIUS_PX: Record<WidgetThemeRadius, number> = {
  sm: 8,
  md: 12,
  lg: 16,
}

export const WIDGET_FONT_FAMILY: Record<WidgetThemeFont, string> = {
  inter: 'Inter, system-ui, sans-serif',
  serif: 'Georgia, "Instrument Serif", serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
  handwritten: '"Comic Sans MS", "Segoe Print", cursive',
}
