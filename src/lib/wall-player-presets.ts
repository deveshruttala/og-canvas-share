/** Visual themes for wall audio & video player overlays. */

export type PlayerLayout = 'compact' | 'card' | 'cinema' | 'wave'

export type PlayerTheme = {
  id: string
  label: string
  layout: PlayerLayout
  background: string
  accent: string
  text: string
  muted: string
  border: string
  shellClass: string
}

export const DEFAULT_AUDIO_PLAYER_THEME = 'neon-lime'
export const DEFAULT_VIDEO_PLAYER_THEME = 'cinema-dark'

export const AUDIO_PLAYER_THEMES: PlayerTheme[] = [
  {
    id: 'neon-lime',
    label: 'Neon Lime',
    layout: 'wave',
    background: 'linear-gradient(145deg, #0f1118 0%, #1a1f2e 55%, #12141a 100%)',
    accent: '#beee1d',
    text: '#fafafa',
    muted: '#a3a3a3',
    border: 'rgba(190, 238, 29, 0.35)',
    shellClass: 'wall-player-audio--neon-lime',
  },
  {
    id: 'card-art',
    label: 'Album Card',
    layout: 'card',
    background: 'linear-gradient(160deg, #18181b 0%, #09090b 100%)',
    accent: '#f472b6',
    text: '#fafafa',
    muted: '#d4d4d4',
    border: 'rgba(244, 114, 182, 0.35)',
    shellClass: 'wall-player-audio--card-art',
  },
  {
    id: 'glass-frost',
    label: 'Glass Frost',
    layout: 'compact',
    background: 'linear-gradient(135deg, rgba(30,41,59,0.92), rgba(15,23,42,0.95))',
    accent: '#38bdf8',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: 'rgba(56, 189, 248, 0.4)',
    shellClass: 'wall-player-audio--glass-frost',
  },
  {
    id: 'sunset-warm',
    label: 'Sunset Warm',
    layout: 'wave',
    background: 'linear-gradient(135deg, #431407 0%, #9a3412 45%, #1c1917 100%)',
    accent: '#fb923c',
    text: '#fff7ed',
    muted: '#fdba74',
    border: 'rgba(251, 146, 60, 0.4)',
    shellClass: 'wall-player-audio--sunset-warm',
  },
  {
    id: 'ocean-deep',
    label: 'Ocean Deep',
    layout: 'wave',
    background: 'linear-gradient(160deg, #0c4a6e 0%, #082f49 50%, #020617 100%)',
    accent: '#22d3ee',
    text: '#ecfeff',
    muted: '#67e8f9',
    border: 'rgba(34, 211, 238, 0.35)',
    shellClass: 'wall-player-audio--ocean-deep',
  },
  {
    id: 'purple-haze',
    label: 'Purple Haze',
    layout: 'card',
    background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 40%, #0f0a1a 100%)',
    accent: '#c084fc',
    text: '#faf5ff',
    muted: '#d8b4fe',
    border: 'rgba(192, 132, 252, 0.4)',
    shellClass: 'wall-player-audio--purple-haze',
  },
  {
    id: 'mono-ink',
    label: 'Mono Ink',
    layout: 'compact',
    background: 'linear-gradient(180deg, #171717 0%, #0a0a0a 100%)',
    accent: '#fafafa',
    text: '#fafafa',
    muted: '#737373',
    border: 'rgba(255, 255, 255, 0.15)',
    shellClass: 'wall-player-audio--mono-ink',
  },
  {
    id: 'forest-moss',
    label: 'Forest Moss',
    layout: 'wave',
    background: 'linear-gradient(145deg, #14532d 0%, #166534 35%, #052e16 100%)',
    accent: '#86efac',
    text: '#ecfccb',
    muted: '#bbf7d0',
    border: 'rgba(134, 239, 172, 0.35)',
    shellClass: 'wall-player-audio--forest-moss',
  },
]

export const VIDEO_PLAYER_THEMES: PlayerTheme[] = [
  {
    id: 'cinema-dark',
    label: 'Cinema',
    layout: 'cinema',
    background: '#000000',
    accent: '#beee1d',
    text: '#fafafa',
    muted: '#a3a3a3',
    border: 'rgba(255, 255, 255, 0.08)',
    shellClass: 'wall-player-video--cinema-dark',
  },
  {
    id: 'neon-frame',
    label: 'Neon Frame',
    layout: 'cinema',
    background: '#050508',
    accent: '#beee1d',
    text: '#fafafa',
    muted: '#737373',
    border: 'rgba(190, 238, 29, 0.55)',
    shellClass: 'wall-player-video--neon-frame',
  },
  {
    id: 'glass-panel',
    label: 'Glass Panel',
    layout: 'cinema',
    background: '#0f172a',
    accent: '#38bdf8',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: 'rgba(56, 189, 248, 0.35)',
    shellClass: 'wall-player-video--glass-panel',
  },
  {
    id: 'sunset-glow',
    label: 'Sunset Glow',
    layout: 'cinema',
    background: '#1c1917',
    accent: '#fb923c',
    text: '#fff7ed',
    muted: '#fdba74',
    border: 'rgba(251, 146, 60, 0.4)',
    shellClass: 'wall-player-video--sunset-glow',
  },
  {
    id: 'arctic-blue',
    label: 'Arctic Blue',
    layout: 'cinema',
    background: '#0c4a6e',
    accent: '#7dd3fc',
    text: '#f0f9ff',
    muted: '#bae6fd',
    border: 'rgba(125, 211, 252, 0.4)',
    shellClass: 'wall-player-video--arctic-blue',
  },
  {
    id: 'berry-pop',
    label: 'Berry Pop',
    layout: 'cinema',
    background: '#4c0519',
    accent: '#f472b6',
    text: '#fdf2f8',
    muted: '#fbcfe8',
    border: 'rgba(244, 114, 182, 0.45)',
    shellClass: 'wall-player-video--berry-pop',
  },
  {
    id: 'minimal-light',
    label: 'Minimal Light',
    layout: 'compact',
    background: '#fafafa',
    accent: '#171717',
    text: '#171717',
    muted: '#525252',
    border: 'rgba(0, 0, 0, 0.08)',
    shellClass: 'wall-player-video--minimal-light',
  },
  {
    id: 'velvet-night',
    label: 'Velvet Night',
    layout: 'cinema',
    background: 'linear-gradient(180deg, #1e1b4b 0%, #0f0a1a 100%)',
    accent: '#a78bfa',
    text: '#ede9fe',
    muted: '#c4b5fd',
    border: 'rgba(167, 139, 250, 0.4)',
    shellClass: 'wall-player-video--velvet-night',
  },
]

export function getAudioPlayerTheme(id?: string): PlayerTheme {
  return AUDIO_PLAYER_THEMES.find((t) => t.id === id) ?? AUDIO_PLAYER_THEMES[0]!
}

export function getVideoPlayerTheme(id?: string): PlayerTheme {
  return VIDEO_PLAYER_THEMES.find((t) => t.id === id) ?? VIDEO_PLAYER_THEMES[0]!
}
