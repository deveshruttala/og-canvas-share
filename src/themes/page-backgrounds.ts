import type { ThemeId } from '@/types/canvas'

export type PageBackgroundStyle = {
  pageBackground: string
  pageFallbackColor?: string
  pageBackgroundSize?: string
  pageBackgroundPosition?: string
  pageBackgroundRepeat?: string
  pageClass?: string
}

/** Artboard (1600×1000) fills — workspace surround uses ThemeConfig.background */
export const PAGE_BACKGROUNDS: Record<ThemeId, PageBackgroundStyle> = {
  corkboard: {
    pageBackground:
      'radial-gradient(ellipse at 25% 15%, #d4b896 0%, transparent 45%), radial-gradient(ellipse at 75% 85%, #9a7348 0%, transparent 40%), linear-gradient(145deg, #c9a06a 0%, #a67c4a 45%, #7a5a32 100%)',
    pageFallbackColor: '#8f6b3d',
    pageClass: 'wall-page-texture',
  },
  whiteboard: {
    pageBackground: '#ffffff',
    pageFallbackColor: '#f8fafc',
    pageClass: 'wall-page-shadow',
  },
  notebook: {
    pageBackground:
      'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px), linear-gradient(90deg, transparent 56px, #fecaca 56px, #fecaca 58px, transparent 58px), #fffef9',
    pageFallbackColor: '#fffef9',
    pageClass: 'wall-page-shadow wall-page-notebook',
  },
  fridge: {
    pageBackground: 'linear-gradient(180deg, #f8fcff 0%, #eef6fb 100%)',
    pageFallbackColor: '#e8f4fc',
    pageClass: 'wall-page-shadow',
  },
  locker: {
    pageBackground: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
    pageFallbackColor: '#cbd5e1',
    pageClass: 'wall-page-shadow',
  },
  dotgrid: {
    pageBackground:
      'radial-gradient(circle, #94a3b8 1px, transparent 1px), #ffffff',
    pageBackgroundSize: '20px 20px',
    pageBackgroundRepeat: 'repeat',
    pageFallbackColor: '#ffffff',
    pageClass: 'wall-page-shadow',
  },
  white: {
    pageBackground: '#ffffff',
    pageFallbackColor: '#f5f5f5',
    pageClass: 'wall-page-shadow',
  },
  cream: {
    pageBackground: 'linear-gradient(180deg, #fffef7 0%, #fef9e7 100%)',
    pageFallbackColor: '#fffbeb',
    pageClass: 'wall-page-shadow',
  },
  concrete: {
    pageBackground: 'linear-gradient(160deg, #e4e4e7 0%, #d4d4d8 50%, #a1a1aa 100%)',
    pageFallbackColor: '#d4d4d8',
    pageClass: 'wall-page-shadow',
  },
  black: {
    pageBackground: '#0a0a0a',
    pageFallbackColor: '#050505',
    pageClass: 'wall-page-border-dark',
  },
  midnight: {
    pageBackground: 'linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
    pageFallbackColor: '#0f172a',
    pageClass: 'wall-page-border-dark',
  },
  chalkboard: {
    pageBackground: 'linear-gradient(145deg, #166534 0%, #14532d 50%, #052e16 100%)',
    pageFallbackColor: '#14532d',
    pageClass: 'wall-page-shadow',
  },
  slate: {
    pageBackground: 'linear-gradient(180deg, #475569 0%, #334155 100%)',
    pageFallbackColor: '#334155',
    pageClass: 'wall-page-shadow',
  },
  glass: {
    pageBackground: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 100%)',
    pageFallbackColor: '#eef2ff',
    pageClass: 'wall-page-glass',
  },
  sunset: {
    pageBackground: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fce7f3 100%)',
    pageFallbackColor: '#fff7ed',
    pageClass: 'wall-page-shadow',
  },
  ocean: {
    pageBackground: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    pageFallbackColor: '#e0f2fe',
    pageClass: 'wall-page-shadow',
  },
  neon: {
    pageBackground: 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
    pageFallbackColor: '#0a0a0f',
    pageClass: 'wall-page-neon',
  },
  pastel: {
    pageBackground: 'linear-gradient(120deg, #fdf2f8 0%, #fae8ff 50%, #ecfeff 100%)',
    pageFallbackColor: '#fdf2f8',
    pageClass: 'wall-page-shadow',
  },
  lavender: {
    pageBackground: 'linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)',
    pageFallbackColor: '#ede9fe',
    pageClass: 'wall-page-shadow',
  },
  mint: {
    pageBackground: 'linear-gradient(160deg, #ecfdf5 0%, #d1fae5 100%)',
    pageFallbackColor: '#ecfdf5',
    pageClass: 'wall-page-shadow',
  },
  rose: {
    pageBackground: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
    pageFallbackColor: '#fff1f2',
    pageClass: 'wall-page-shadow',
  },
  wood: {
    pageBackground:
      'repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.04) 12px, rgba(0,0,0,0.04) 13px), linear-gradient(180deg, #d97706 0%, #92400e 50%, #78350f 100%)',
    pageFallbackColor: '#92400e',
    pageClass: 'wall-page-texture',
  },
  sky: {
    pageBackground: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    pageFallbackColor: '#f0f9ff',
    pageClass: 'wall-page-shadow',
  },
  forest: {
    pageBackground: 'linear-gradient(160deg, #dcfce7 0%, #bbf7d0 40%, #86efac 100%)',
    pageFallbackColor: '#dcfce7',
    pageClass: 'wall-page-shadow',
  },
  paper: {
    pageBackground:
      'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px), #f5f0e8',
    pageFallbackColor: '#f5f0e8',
    pageClass: 'wall-page-texture wall-page-shadow',
  },
  galaxy: {
    pageBackground:
      'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236,72,153,0.15) 0%, transparent 45%), #0f172a',
    pageFallbackColor: '#0f172a',
    pageClass: 'wall-page-shadow',
  },
  cyber: {
    pageBackground:
      'radial-gradient(circle, rgba(34,211,238,0.08) 1px, transparent 1px), #111827',
    pageBackgroundSize: '16px 16px',
    pageBackgroundRepeat: 'repeat',
    pageFallbackColor: '#111827',
    pageClass: 'wall-page-shadow',
  },
  coral: {
    pageBackground: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #ccfbf1 100%)',
    pageFallbackColor: '#fff7ed',
    pageClass: 'wall-page-shadow',
  },
  zen: {
    pageBackground: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
    pageFallbackColor: '#fafaf9',
    pageClass: 'wall-page-shadow',
  },
  apricot: {
    pageBackground: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
    pageFallbackColor: '#fff7ed',
    pageClass: 'wall-page-shadow',
  },
  terracotta: {
    pageBackground: 'linear-gradient(145deg, #ffedd5 0%, #fdba74 50%, #ea580c 100%)',
    pageFallbackColor: '#fdba74',
    pageClass: 'wall-page-texture',
  },
  arctic: {
    pageBackground: 'linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%)',
    pageFallbackColor: '#f0f9ff',
    pageClass: 'wall-page-shadow',
  },
  blossom: {
    pageBackground: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    pageFallbackColor: '#fdf2f8',
    pageClass: 'wall-page-shadow',
  },
  comic: {
    pageBackground: '#fef08a',
    pageFallbackColor: '#fef08a',
    pageClass: 'wall-page-shadow border-4 border-black',
  },
  espresso: {
    pageBackground: 'linear-gradient(160deg, #44403c 0%, #292524 50%, #1c1917 100%)',
    pageFallbackColor: '#292524',
    pageClass: 'wall-page-shadow',
  },
  sapphire: {
    pageBackground: 'linear-gradient(160deg, #dbeafe 0%, #93c5fd 50%, #60a5fa 100%)',
    pageFallbackColor: '#dbeafe',
    pageClass: 'wall-page-shadow',
  },
  ember: {
    pageBackground: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
    pageFallbackColor: '#292524',
    pageClass: 'wall-page-shadow',
  },
  orchid: {
    pageBackground: 'linear-gradient(135deg, #fae8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    pageFallbackColor: '#fae8ff',
    pageClass: 'wall-page-shadow',
  },
  sand: {
    pageBackground: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
    pageFallbackColor: '#fffbeb',
    pageClass: 'wall-page-texture',
  },
  ink: {
    pageBackground: '#ffffff',
    pageFallbackColor: '#ffffff',
    pageClass: 'wall-page-shadow border border-neutral-300',
  },
  nordic: {
    pageBackground: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    pageFallbackColor: '#f8fafc',
    pageClass: 'wall-page-shadow',
  },
  vintage: {
    pageBackground:
      'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(120,113,108,0.06) 3px, rgba(120,113,108,0.06) 4px), #f5f0e6',
    pageFallbackColor: '#f5f0e6',
    pageClass: 'wall-page-texture wall-page-shadow',
  },
  limeade: {
    pageBackground: 'linear-gradient(180deg, #f7fee7 0%, #ecfccb 100%)',
    pageFallbackColor: '#f7fee7',
    pageClass: 'wall-page-shadow',
  },
  twilight: {
    pageBackground: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)',
    pageFallbackColor: '#1e1b4b',
    pageClass: 'wall-page-shadow',
  },
  mango: {
    pageBackground: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
    pageFallbackColor: '#fff7ed',
    pageClass: 'wall-page-shadow',
  },
  glacier: {
    pageBackground: 'linear-gradient(180deg, #ffffff 0%, #ecfeff 100%)',
    pageFallbackColor: '#ecfeff',
    pageClass: 'wall-page-shadow',
  },
  copper: {
    pageBackground: 'linear-gradient(145deg, #ffedd5 0%, #fdba74 50%, #d97706 100%)',
    pageFallbackColor: '#fdba74',
    pageClass: 'wall-page-texture',
  },
  grape: {
    pageBackground: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
    pageFallbackColor: '#ede9fe',
    pageClass: 'wall-page-shadow',
  },
  storm: {
    pageBackground: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
    pageFallbackColor: '#1e293b',
    pageClass: 'wall-page-shadow',
  },
  matcha: {
    pageBackground: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
    pageFallbackColor: '#f0fdf4',
    pageClass: 'wall-page-shadow',
  },
  blush: {
    pageBackground: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    pageFallbackColor: '#fff1f2',
    pageClass: 'wall-page-shadow',
  },
}
