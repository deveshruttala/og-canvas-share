export type OmniItemKind =
  | 'action'
  | 'image'
  | 'gif'
  | 'audio'
  | 'emoji'
  | 'icon'
  | 'widget'
  | 'link'
  | 'ai-hint'

export type OmniItem = {
  id: string
  kind: OmniItemKind
  title: string
  subtitle?: string
  thumb?: string
  previewUrl?: string
  emoji?: string
  icon?: string
  url?: string
  duration?: number
  source: string
  attribution?: string
  payload?: Record<string, unknown>
}

export type OmniSection = {
  id: string
  title: string
  source: string
  items: OmniItem[]
  more?: boolean
  loading?: boolean
  error?: string
  needsKey?: string
}

export type ProviderResult = {
  section: Omit<OmniSection, 'loading'>
}
