/**
 * Wall content source picks — one primary provider per job (long-term maintainability).
 * Used for Connections hints and Omni section labels.
 */

export type SourceTier = 'A' | 'B' | 'C'

export type SourcePick = {
  id: string
  name: string
  category: 'images' | 'audio' | 'gifs' | 'icons' | 'emojis' | 'links' | 'data' | 'video'
  tier: SourceTier
  needsKey: boolean
  integrated: boolean
  why: string
  attribution?: string
}

/** What Wall uses today — keep this list accurate when adding providers. */
export const WALL_SOURCE_PICKS: SourcePick[] = [
  {
    id: 'wikimedia',
    name: 'Wikimedia Commons',
    category: 'images',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'No key, stable API, encyclopedic + free photos.',
  },
  {
    id: 'metmuseum',
    name: 'Met Museum',
    category: 'images',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: '470k+ open artworks; best no-key museum art.',
    attribution: 'The Metropolitan Museum of Art',
  },
  {
    id: 'artic',
    name: 'Art Institute of Chicago',
    category: 'images',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Fast search + IIIF thumbnails; excellent docs.',
    attribution: 'Art Institute of Chicago',
  },
  {
    id: 'pexels',
    name: 'Pexels',
    category: 'images',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Best stock photo API UX; photos + video one key.',
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    category: 'images',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Huge CC library; same key for images + audio.',
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    category: 'images',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Curated photography; attribution required.',
    attribution: 'Unsplash',
  },
  {
    id: 'picsum',
    name: 'Picsum',
    category: 'images',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Deterministic fallback when APIs fail.',
  },
  {
    id: 'itunes',
    name: 'iTunes Preview',
    category: 'audio',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Reliable 30s music previews; Deezer search is currently empty in many regions.',
  },
  {
    id: 'mixkit',
    name: 'Mixkit SFX',
    category: 'audio',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Bundled SFX clips; always playable.',
  },
  {
    id: 'freesound',
    name: 'Freesound',
    category: 'audio',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Best CC0 SFX search at scale.',
  },
  {
    id: 'archive',
    name: 'Internet Archive',
    category: 'audio',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Public-domain audio when stock APIs miss.',
  },
  {
    id: 'tenor',
    name: 'Tenor',
    category: 'gifs',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Generous free tier; better search than Giphy for many queries.',
  },
  {
    id: 'giphy',
    name: 'Giphy',
    category: 'gifs',
    tier: 'B',
    needsKey: true,
    integrated: true,
    why: 'Largest GIF index; pairs with Tenor.',
  },
  {
    id: 'iconify',
    name: 'Iconify',
    category: 'icons',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: '200k+ icons across sets; single search API, no key.',
  },
  {
    id: 'emoji-lib',
    name: 'Unicode emoji library',
    category: 'emojis',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'Offline-fast; no API dependency.',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    category: 'links',
    tier: 'A',
    needsKey: false,
    integrated: true,
    why: 'OpenSearch for reference links.',
  },
  {
    id: 'microlink',
    name: 'Microlink',
    category: 'links',
    tier: 'B',
    needsKey: false,
    integrated: true,
    why: 'OG metadata for paste-any-URL cards (via proxy).',
  },
  {
    id: 'deezer',
    name: 'Deezer',
    category: 'audio',
    tier: 'A',
    needsKey: false,
    integrated: false,
    why: 'Skipped for now — API returns empty track lists in production tests.',
  },
  {
    id: 'openverse',
    name: 'Openverse',
    category: 'images',
    tier: 'B',
    needsKey: false,
    integrated: false,
    why: 'Skipped — Cloudflare blocks API (403).',
  },
]

export function picksForCategory(cat: SourcePick['category']): SourcePick[] {
  return WALL_SOURCE_PICKS.filter((p) => p.category === cat && p.integrated)
}
