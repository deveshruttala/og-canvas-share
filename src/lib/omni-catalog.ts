/** Omni search UX: filters, placeholders, quick tags, and section copy. */

export type OmniSearchFilter =
  | 'all'
  | 'images'
  | 'gifs'
  | 'video'
  | 'audio'
  | 'emojis'
  | 'stickers'
  | 'widgets'
  | 'text'
  | 'shapes'
  | 'themes'
  | 'actions'

export type OmniThumbCols = 4 | 5 | 6

export const OMNI_SEARCH_FILTERS: {
  id: OmniSearchFilter
  label: string
  shortLabel: string
  hint: string
  emoji: string
  group: 'media' | 'create' | 'wall'
}[] = [
  { id: 'all', label: 'All', shortLabel: 'All', hint: 'Search everything at once', emoji: '✨', group: 'wall' },
  { id: 'images', label: 'Images', shortLabel: 'Img', hint: 'Openverse stock (no key) + Pixabay/Pexels/Unsplash', emoji: '🖼️', group: 'media' },
  { id: 'gifs', label: 'GIFs', shortLabel: 'GIF', hint: 'Animated loops — Giphy, Tenor', emoji: '🎬', group: 'media' },
  { id: 'video', label: 'Video', shortLabel: 'Vid', hint: 'YouTube search · stock clips · paste watch URL', emoji: '🎥', group: 'media' },
  { id: 'audio', label: 'Audio', shortLabel: 'Audio', hint: 'Search songs · YouTube & Spotify · iTunes · SFX', emoji: '🎵', group: 'media' },
  { id: 'emojis', label: 'Emojis', shortLabel: 'Emoji', hint: 'Emoji stamps from the full library', emoji: '😀', group: 'create' },
  { id: 'stickers', label: 'Stickers', shortLabel: 'Stick', hint: 'Emojis + icon stickers combined', emoji: '⭐', group: 'create' },
  { id: 'text', label: 'Text', shortLabel: 'Text', hint: 'Text boxes, stickies, typography widgets', emoji: '🔤', group: 'create' },
  { id: 'shapes', label: 'Shapes', shortLabel: 'Shape', hint: 'Geo shapes, frames, dividers', emoji: '⬡', group: 'create' },
  { id: 'widgets', label: 'Widgets', shortLabel: 'Widget', hint: 'Notion, GitHub, QR, Spotify · paste any URL', emoji: '🧩', group: 'wall' },
  { id: 'themes', label: 'Themes', shortLabel: 'Theme', hint: 'Canvas backgrounds and moods', emoji: '🎨', group: 'wall' },
  { id: 'actions', label: 'Actions', shortLabel: 'Act', hint: 'Themes, arrange, share, undo', emoji: '⚡', group: 'wall' },
]

/** Default search when a category is open with an empty query (browse mode). */
export const OMNI_BROWSE_QUERIES: Partial<Record<OmniSearchFilter, string>> = {
  images: 'cinematic landscape',
  gifs: 'celebration party',
  video: 'cinematic nature drone',
  audio: 'lofi piano ambient',
  emojis: 'fire rocket star',
  stickers: 'sparkle badge icon',
  widgets: 'clock weather',
  text: 'heading quote',
  shapes: 'arrow frame',
  themes: 'neon dark',
  actions: 'arrange share undo',
}

export type OmniQuickTag = { label: string; query: string; emoji?: string }

export const OMNI_QUICK_TAGS: Partial<Record<OmniSearchFilter, OmniQuickTag[]>> = {
  all: [
    { label: 'Sunset', query: 'sunset golden hour', emoji: '🌅' },
    { label: 'GIF party', query: 'party celebration gif', emoji: '🎉' },
    { label: 'Neon theme', query: 'change theme to neon', emoji: '💚' },
    { label: 'GitHub', query: 'github stats widget', emoji: '🐙' },
  ],
  video: [
    { label: 'Music video', query: 'official music video', emoji: '🎬' },
    { label: 'Nature', query: 'nature forest aerial', emoji: '🌲' },
    { label: 'City', query: 'city timelapse night', emoji: '🌃' },
    { label: 'Ocean', query: 'ocean waves beach', emoji: '🌊' },
  ],
  images: [
    { label: 'Train', query: 'train railway locomotive', emoji: '🚂' },
    { label: 'Movies', query: 'cinema movie film still', emoji: '🎬' },
    { label: 'Nature', query: 'nature forest mountains', emoji: '🌲' },
    { label: 'Portrait', query: 'portrait photography', emoji: '📷' },
    { label: 'Abstract', query: 'abstract gradient art', emoji: '🎨' },
    { label: 'City', query: 'city skyline night', emoji: '🌃' },
    { label: 'Food', query: 'food photography', emoji: '🍕' },
  ],
  gifs: [
    { label: 'LOL', query: 'laugh funny', emoji: '😂' },
    { label: 'Celebrate', query: 'celebration confetti', emoji: '🎊' },
    { label: 'Love', query: 'heart love', emoji: '❤️' },
    { label: 'Wow', query: 'mind blown amazing', emoji: '🤯' },
    { label: 'Dance', query: 'dance moves', emoji: '💃' },
  ],
  audio: [
    { label: 'Despacito', query: 'despacito luis fonsi', emoji: '🎤' },
    { label: 'Lofi', query: 'lofi chill beats', emoji: '🎧' },
    { label: 'Spotify', query: 'spotify focus playlist', emoji: '🎵' },
    { label: 'YouTube', query: 'chill music youtube', emoji: '▶️' },
    { label: 'Piano', query: 'piano calm music', emoji: '🎹' },
    { label: 'Rain', query: 'rain ambient', emoji: '🌧️' },
    { label: 'UI sounds', query: 'notification click ui', emoji: '🔔' },
  ],
  emojis: [
    { label: 'Work', query: 'office laptop', emoji: '💼' },
    { label: 'Love', query: 'heart love', emoji: '❤️' },
    { label: 'Party', query: 'party celebrate', emoji: '🎉' },
    { label: 'Nature', query: 'plant sun tree', emoji: '🌿' },
  ],
  stickers: [
    { label: 'Icons', query: 'icon badge', emoji: '🏷️' },
    { label: 'Arrows', query: 'arrow pointer', emoji: '➡️' },
    { label: 'Stars', query: 'star sparkle', emoji: '✨' },
    { label: 'Tech', query: 'code dev laptop', emoji: '💻' },
  ],
  widgets: [
    { label: 'Notion', query: 'notion', emoji: '📓' },
    { label: 'GitHub', query: 'github', emoji: '🐙' },
    { label: 'Spotify', query: 'spotify widget', emoji: '🎵' },
    { label: 'Clock', query: 'clock countdown', emoji: '⏱️' },
    { label: 'Weather', query: 'weather forecast', emoji: '☁️' },
    { label: 'QR', query: 'qr code', emoji: '📱' },
    { label: 'Figma', query: 'figma', emoji: '🎨' },
  ],
  text: [
    { label: 'Heading', query: 'heading title', emoji: '📌' },
    { label: 'Quote', query: 'quote block', emoji: '💬' },
    { label: 'Sticky', query: 'sticky note', emoji: '📝' },
    { label: 'List', query: 'checklist todo', emoji: '✅' },
  ],
  shapes: [
    { label: 'Arrow', query: 'arrow line', emoji: '➡️' },
    { label: 'Frame', query: 'frame border', emoji: '🖼️' },
    { label: 'Circle', query: 'circle badge', emoji: '⭕' },
    { label: 'Divider', query: 'divider separator', emoji: '➖' },
  ],
  themes: [
    { label: 'Neon', query: 'neon', emoji: '💚' },
    { label: 'Dark', query: 'midnight', emoji: '🌙' },
    { label: 'Fridge', query: 'fridge', emoji: '🧊' },
    { label: 'Paper', query: 'paper', emoji: '📄' },
    { label: 'Galaxy', query: 'galaxy', emoji: '🌌' },
    { label: 'Cork', query: 'corkboard', emoji: '📌' },
    { label: 'Apricot', query: 'apricot', emoji: '🍑' },
    { label: 'Espresso', query: 'espresso coffee', emoji: '☕' },
  ],
  actions: [
    { label: 'Arrange', query: 'arrange', emoji: '📐' },
    { label: 'Share', query: 'share', emoji: '🔗' },
    { label: 'Undo', query: 'undo', emoji: '↩️' },
    { label: 'Add text', query: 'add text', emoji: '🔤' },
    { label: 'Theme neon', query: 'change theme to neon', emoji: '💚' },
    { label: 'Widgets', query: 'widget library', emoji: '🧩' },
    { label: 'GIFs', query: 'gif', emoji: '🎬' },
    { label: 'Connections', query: 'api keys', emoji: '🔑' },
  ],
}

export const OMNI_PLACEHOLDERS = [
  'Search images, GIFs, widgets, songs, emojis…',
  'Try Audio → despacito (YouTube & Spotify)',
  'Try Video → music video or nature clips',
  'Try Widgets → notion github spotify',
  'Try Images → train or cinematic',
  'Paste a YouTube or Spotify URL in any tab',
]

export const OMNI_SECTION_HELP: Record<string, { title: string; description: string }> = {
  actions: {
    title: 'Suggested actions',
    description: 'Arrange, share, undo, add content, zoom, and open tools',
  },
  images: {
    title: 'Images',
    description: 'Openverse stock photos (no key). Pixabay/Pexels/Unsplash with keys. Museums for art queries.',
  },
  gifs: { title: 'GIFs', description: 'Animated loops — add Giphy/Tenor keys in Connections for more' },
  videos: {
    title: 'Video clips',
    description: 'Coverr stock video (no key). Pexels HD clips with your Pexels key.',
  },
  streaming: {
    title: 'YouTube & Spotify',
    description: 'Search songs and add embed players. Paste a track URL at the top of any tab.',
  },
  youtube: {
    title: 'YouTube',
    description: 'Search videos to embed. Paste a youtube.com/watch URL.',
  },
  'paste-url': {
    title: 'Add to wall',
    description: 'Paste a URL for an embed player or rich link card.',
  },
  audio: {
    title: 'Audio clips',
    description: 'iTunes previews, SFX, and ambient sounds. Use Audio tab streaming row for full songs.',
  },
  icons: {
    title: 'Icons',
    description: 'Iconify search across 200k+ icon sets — no API key',
  },
  'audio-widgets': {
    title: 'Music widgets',
    description: 'Spotify playlists, sound pads, and synth blocks',
  },
  emojis: { title: 'Emojis', description: 'Stamp onto the wall — or open full picker from dock' },
  stickers: { title: 'Stickers & icons', description: 'Emojis and icon stamps in one place' },
  widgets: {
    title: 'Widgets & services',
    description: 'Notion, GitHub, Spotify, QR, clocks — plus paste any https:// URL',
  },
  text: { title: 'Text & notes', description: 'Add typography and note widgets' },
  shapes: { title: 'Shapes & layout', description: 'Frames, arrows, and structure widgets' },
  themes: { title: 'Canvas themes', description: 'Change the whole wall mood instantly' },
}

export function omniFilterPlaceholder(filter: OmniSearchFilter): string {
  const row = OMNI_SEARCH_FILTERS.find((f) => f.id === filter)
  if (!row || filter === 'all') return OMNI_PLACEHOLDERS[0]
  return `${row.emoji} Search ${row.label.toLowerCase()} — ${row.hint}`
}

export function getOmniQuickTags(filter: OmniSearchFilter): OmniQuickTag[] {
  return OMNI_QUICK_TAGS[filter] ?? OMNI_QUICK_TAGS.all ?? []
}
