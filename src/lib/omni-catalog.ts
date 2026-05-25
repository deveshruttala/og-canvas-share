/** Omni search UX: filters, placeholders, and section copy. */

export type OmniSearchFilter =
  | 'all'
  | 'images'
  | 'gifs'
  | 'audio'
  | 'emojis'
  | 'widgets'
  | 'links'
  | 'actions'

export const OMNI_SEARCH_FILTERS: {
  id: OmniSearchFilter
  label: string
  hint: string
  emoji: string
}[] = [
  { id: 'all', label: 'All', hint: 'Search everything at once', emoji: '✨' },
  { id: 'images', label: 'Images', hint: 'Photos from Openverse, Unsplash, Pexels', emoji: '🖼️' },
  { id: 'gifs', label: 'GIFs', hint: 'Animated GIFs — Giphy, Tenor, Openverse', emoji: '🎬' },
  { id: 'audio', label: 'Audio', hint: 'Music clips and sound bites', emoji: '🎵' },
  { id: 'emojis', label: 'Emojis', hint: 'Emoji stamps and icon stickers', emoji: '😀' },
  { id: 'widgets', label: 'Widgets', hint: 'Clocks, GitHub, weather, QR, stickies', emoji: '🧩' },
  { id: 'links', label: 'Links', hint: 'Paste URLs for rich link cards', emoji: '🔗' },
  { id: 'actions', label: 'Actions', hint: 'Themes, arrange, share, undo', emoji: '⚡' },
]

export const OMNI_PLACEHOLDERS = [
  'Search images, GIFs, widgets, emojis, audio…',
  'Try filter: GIFs → celebration',
  'Try filter: Images → sunset landscape',
  'Try filter: Widgets → github stats',
  'Try filter: Emojis → rocket startup',
  'Try: change theme to neon',
  'Try: add a lofi playlist widget',
  'Try filter: Audio → piano',
]

export const OMNI_SECTION_HELP: Record<string, { title: string; description: string }> = {
  actions: { title: 'Suggested actions', description: 'Quick commands for your wall' },
  images: { title: 'Images', description: 'Royalty-free photos — click to place on canvas' },
  gifs: { title: 'GIFs', description: 'Animated loops — add Giphy/Tenor keys in Connections for more' },
  audio: { title: 'Audio', description: 'Clips you can drop as audio widgets' },
  emojis: { title: 'Emojis & icons', description: 'Stamp onto the wall — or open full picker from dock' },
  icons: { title: 'Icon stickers', description: 'Search “icon” plus a topic' },
  widgets: { title: 'Widgets', description: 'Pre-built blocks from the widget library' },
  links: { title: 'Links', description: 'URLs become link cards or embeds' },
}

export function omniFilterPlaceholder(filter: OmniSearchFilter): string {
  const row = OMNI_SEARCH_FILTERS.find((f) => f.id === filter)
  if (!row || filter === 'all') return OMNI_PLACEHOLDERS[0]
  return `${row.emoji} ${row.label}: ${row.hint}`
}
