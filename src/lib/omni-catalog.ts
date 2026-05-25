/** Omni search UX: filters, placeholders, quick tags, and section copy. */

export type OmniSearchFilter =
  | 'all'
  | 'images'
  | 'gifs'
  | 'audio'
  | 'emojis'
  | 'stickers'
  | 'widgets'
  | 'text'
  | 'shapes'
  | 'themes'
  | 'links'
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
  { id: 'images', label: 'Images', shortLabel: 'Img', hint: 'Met + Art Institute + Wikimedia + Pixabay/Pexels', emoji: '🖼️', group: 'media' },
  { id: 'gifs', label: 'GIFs', shortLabel: 'GIF', hint: 'Animated loops — Giphy, Tenor, Openverse', emoji: '🎬', group: 'media' },
  { id: 'audio', label: 'Audio', shortLabel: 'Audio', hint: 'iTunes song previews · Mixkit SFX · Pixabay/Freesound', emoji: '🎵', group: 'media' },
  { id: 'emojis', label: 'Emojis', shortLabel: 'Emoji', hint: 'Emoji stamps from the full library', emoji: '😀', group: 'create' },
  { id: 'stickers', label: 'Stickers', shortLabel: 'Stick', hint: 'Emojis + icon stickers combined', emoji: '⭐', group: 'create' },
  { id: 'text', label: 'Text', shortLabel: 'Text', hint: 'Text boxes, stickies, typography widgets', emoji: '🔤', group: 'create' },
  { id: 'shapes', label: 'Shapes', shortLabel: 'Shape', hint: 'Geo shapes, frames, dividers', emoji: '⬡', group: 'create' },
  { id: 'widgets', label: 'Widgets', shortLabel: 'Widget', hint: 'Clocks, GitHub, weather, QR, tools', emoji: '🧩', group: 'wall' },
  { id: 'themes', label: 'Themes', shortLabel: 'Theme', hint: 'Canvas backgrounds and moods', emoji: '🎨', group: 'wall' },
  { id: 'links', label: 'Links', shortLabel: 'Link', hint: 'Paste URLs for rich link cards', emoji: '🔗', group: 'wall' },
  { id: 'actions', label: 'Actions', shortLabel: 'Act', hint: 'Themes, arrange, share, undo', emoji: '⚡', group: 'wall' },
]

/** Default search when a category is open with an empty query (browse mode). */
export const OMNI_BROWSE_QUERIES: Partial<Record<OmniSearchFilter, string>> = {
  images: 'cinematic landscape',
  gifs: 'celebration party',
  audio: 'lofi piano ambient',
  emojis: 'fire rocket star',
  stickers: 'sparkle badge icon',
  widgets: 'clock weather',
  text: 'heading quote',
  shapes: 'arrow frame',
  themes: 'neon dark',
  links: 'youtube github',
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
  images: [
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
    { label: 'Lofi', query: 'lofi chill beats', emoji: '🎧' },
    { label: 'Piano', query: 'piano calm music', emoji: '🎹' },
    { label: 'Jazz', query: 'jazz lounge', emoji: '🎷' },
    { label: 'Rain', query: 'rain ambient', emoji: '🌧️' },
    { label: 'Ocean', query: 'ocean waves', emoji: '🌊' },
    { label: 'UI sounds', query: 'notification click ui', emoji: '🔔' },
    { label: 'Applause', query: 'applause celebration', emoji: '👏' },
    { label: 'Spotify', query: 'spotify focus', emoji: '🎵' },
    { label: 'Nature', query: 'forest birds nature', emoji: '🌲' },
    { label: 'Game', query: 'arcade game sfx', emoji: '🎮' },
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
    { label: 'Clock', query: 'clock countdown', emoji: '⏱️' },
    { label: 'Weather', query: 'weather forecast', emoji: '☁️' },
    { label: 'GitHub', query: 'github', emoji: '🐙' },
    { label: 'Spotify', query: 'spotify music', emoji: '🎵' },
    { label: 'QR', query: 'qr code', emoji: '📱' },
    { label: 'Goals', query: 'progress goal', emoji: '📈' },
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
  links: [
    { label: 'YouTube', query: 'youtube', emoji: '▶️' },
    { label: 'Spotify', query: 'spotify', emoji: '🎵' },
    { label: 'GitHub', query: 'github', emoji: '🐙' },
    { label: 'Notion', query: 'notion', emoji: '📓' },
    { label: 'Figma', query: 'figma', emoji: '🎨' },
    { label: 'Paste URL', query: 'https://example.com', emoji: '🔗' },
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
  'Search images, GIFs, widgets, emojis, audio…',
  'Try Images → movies or cinematic',
  'Try GIFs → celebration',
  'Try Widgets → github weather clock',
  'Try Themes → neon galaxy cork',
  'Try Text → sticky heading quote',
  'Try Actions → change theme to neon',
  'Paste a link to add a rich card',
]

export const OMNI_SECTION_HELP: Record<string, { title: string; description: string }> = {
  actions: {
    title: 'Suggested actions',
    description: 'Arrange, share, undo, add content, zoom, and open tools',
  },
  images: {
    title: 'Images',
    description: 'Met Museum + Art Institute + Wikimedia (no key). Pixabay/Pexels/Unsplash with keys.',
  },
  gifs: { title: 'GIFs', description: 'Animated loops — add Giphy/Tenor keys in Connections for more' },
  audio: {
    title: 'Audio',
    description: 'iTunes 30s song previews (no key) + Mixkit SFX. Pixabay/Freesound for more.',
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
  widgets: { title: 'Widgets', description: 'Pre-built blocks from the widget library' },
  text: { title: 'Text & notes', description: 'Add typography and note widgets' },
  shapes: { title: 'Shapes & layout', description: 'Frames, arrows, and structure widgets' },
  themes: { title: 'Canvas themes', description: 'Change the whole wall mood instantly' },
  links: {
    title: 'Links',
    description: 'Quick sites, Wikipedia matches, or paste any https:// URL',
  },
}

export function omniFilterPlaceholder(filter: OmniSearchFilter): string {
  const row = OMNI_SEARCH_FILTERS.find((f) => f.id === filter)
  if (!row || filter === 'all') return OMNI_PLACEHOLDERS[0]
  return `${row.emoji} Search ${row.label.toLowerCase()} — ${row.hint}`
}

export function getOmniQuickTags(filter: OmniSearchFilter): OmniQuickTag[] {
  return OMNI_QUICK_TAGS[filter] ?? OMNI_QUICK_TAGS.all ?? []
}
