import type { ThemeId } from '@/types/canvas'
import { PAGE_BACKGROUNDS, type PageBackgroundStyle } from '@/themes/page-backgrounds'

export type { ThemeId }

export type ThemeCategory = 'classic' | 'minimal' | 'dark' | 'color'

export type ThemeConfig = {
  id: ThemeId
  label: string
  category: ThemeCategory
  description: string
  /** Surround outside the 1600×1000 page */
  background: string
  workspaceClass?: string
  /** Artboard surface (inside the page bounds); merged from PAGE_BACKGROUNDS in getTheme() */
  pageBackground?: string
  pageFallbackColor?: string
  pageBackgroundSize?: string
  pageBackgroundPosition?: string
  pageBackgroundRepeat?: string
  pageClass?: string
  canvasClass: string
  defaultAccent: string
  /** Legacy tldraw frame (kept invisible; page is WallPageCanvas) */
  boardColor: string
  boardFill: 'solid' | 'semi' | 'none'
}

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'dark', label: 'Dark' },
  { id: 'color', label: 'Color' },
]

export const themes: Record<ThemeId, ThemeConfig> = {
  corkboard: {
    id: 'corkboard',
    label: 'Corkboard',
    category: 'classic',
    description: 'Warm cork with soft vignette',
    background:
      'radial-gradient(ellipse at 30% 20%, #c4a574 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #8b6914 0%, transparent 40%), linear-gradient(145deg, #b8956a 0%, #8f6b3d 50%, #6b4f2a 100%)',
    canvasClass: 'shadow-wall-lg',
    defaultAccent: '#e8a838',
    boardColor: 'yellow',
    boardFill: 'semi',
  },
  whiteboard: {
    id: 'whiteboard',
    label: 'Whiteboard',
    category: 'classic',
    description: 'Clean studio white',
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    canvasClass: 'shadow-wall border border-slate-200',
    defaultAccent: '#3b82f6',
    boardColor: 'white',
    boardFill: 'solid',
  },
  notebook: {
    id: 'notebook',
    label: 'Notebook',
    category: 'classic',
    description: 'Lined paper margin',
    background:
      'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px), #fffef9',
    canvasClass: 'shadow-wall border-l-4 border-red-300',
    defaultAccent: '#dc2626',
    boardColor: 'white',
    boardFill: 'solid',
  },
  fridge: {
    id: 'fridge',
    label: 'Fridge',
    category: 'classic',
    description: 'Cool appliance blue',
    background: 'linear-gradient(180deg, #e8f4fc 0%, #d0e8f5 100%)',
    canvasClass: 'shadow-wall border border-slate-300/50',
    defaultAccent: '#ef4444',
    boardColor: 'white',
    boardFill: 'solid',
  },
  locker: {
    id: 'locker',
    label: 'Locker',
    category: 'classic',
    description: 'Metal hallway grey',
    background: 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
    canvasClass: 'shadow-wall-lg border-4 border-slate-600',
    defaultAccent: '#fbbf24',
    boardColor: 'white',
    boardFill: 'semi',
  },
  dotgrid: {
    id: 'dotgrid',
    label: 'Dot grid',
    category: 'minimal',
    description: 'Designer dot paper',
    background:
      'radial-gradient(circle, #cbd5e1 1px, transparent 1px), linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
    workspaceClass: 'wall-theme-dotgrid',
    canvasClass: 'shadow-wall border border-slate-200',
    defaultAccent: '#6366f1',
    boardColor: 'white',
    boardFill: 'solid',
  },
  white: {
    id: 'white',
    label: 'Pure white',
    category: 'minimal',
    description: 'Bright neutral',
    background: '#f5f5f5',
    canvasClass: 'border border-neutral-200 shadow-wall',
    defaultAccent: '#0a0a0a',
    boardColor: 'white',
    boardFill: 'solid',
  },
  cream: {
    id: 'cream',
    label: 'Cream',
    category: 'minimal',
    description: 'Soft warm paper',
    background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
    canvasClass: 'shadow-wall border border-amber-100',
    defaultAccent: '#b45309',
    boardColor: 'yellow',
    boardFill: 'solid',
  },
  concrete: {
    id: 'concrete',
    label: 'Concrete',
    category: 'minimal',
    description: 'Industrial grey',
    background: 'linear-gradient(160deg, #d4d4d8 0%, #a1a1aa 50%, #71717a 100%)',
    canvasClass: 'shadow-wall-lg',
    defaultAccent: '#52525b',
    boardColor: 'white',
    boardFill: 'solid',
  },
  black: {
    id: 'black',
    label: 'Pure black',
    category: 'dark',
    description: 'OLED black surround',
    background: '#050505',
    canvasClass: 'border border-neutral-800',
    defaultAccent: '#beee1d',
    boardColor: 'black',
    boardFill: 'solid',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    category: 'dark',
    description: 'Deep blue night',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)',
    canvasClass: 'border border-indigo-900/50 shadow-wall-lg',
    defaultAccent: '#818cf8',
    boardColor: 'black',
    boardFill: 'solid',
  },
  chalkboard: {
    id: 'chalkboard',
    label: 'Chalkboard',
    category: 'dark',
    description: 'Green classroom board',
    background: 'linear-gradient(145deg, #14532d 0%, #166534 40%, #052e16 100%)',
    canvasClass: 'border-4 border-emerald-900 shadow-wall-lg',
    defaultAccent: '#fef08a',
    boardColor: 'green',
    boardFill: 'solid',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    category: 'dark',
    description: 'Charcoal matte',
    background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
    canvasClass: 'border border-slate-600 shadow-wall',
    defaultAccent: '#38bdf8',
    boardColor: 'black',
    boardFill: 'semi',
  },
  glass: {
    id: 'glass',
    label: 'Glass',
    category: 'color',
    description: 'Purple gradient glass',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    canvasClass: 'backdrop-blur-md bg-white/20 border border-white/30 shadow-wall-lg',
    defaultAccent: '#a78bfa',
    boardColor: 'white',
    boardFill: 'semi',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    category: 'color',
    description: 'Warm orange sky',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 45%, #6366f1 100%)',
    canvasClass: 'shadow-wall-lg border border-white/20',
    defaultAccent: '#fde047',
    boardColor: 'orange',
    boardFill: 'semi',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    category: 'color',
    description: 'Deep aqua waves',
    background: 'linear-gradient(160deg, #0ea5e9 0%, #0369a1 50%, #0c4a6e 100%)',
    canvasClass: 'shadow-wall-lg border border-cyan-500/30',
    defaultAccent: '#67e8f9',
    boardColor: 'light-blue',
    boardFill: 'semi',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    category: 'color',
    description: 'Dark with lime glow',
    background:
      'radial-gradient(circle at 50% 0%, rgba(190, 238, 29, 0.15), transparent 55%), linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
    canvasClass: 'border border-[#beee1d]/30 shadow-[0_0_40px_rgba(190,238,29,0.15)]',
    defaultAccent: '#beee1d',
    boardColor: 'black',
    boardFill: 'solid',
  },
  pastel: {
    id: 'pastel',
    label: 'Pastel',
    category: 'color',
    description: 'Soft candy hues',
    background: 'linear-gradient(120deg, #fce7f3 0%, #e9d5ff 50%, #cffafe 100%)',
    canvasClass: 'shadow-wall border border-white/60',
    defaultAccent: '#ec4899',
    boardColor: 'light-violet',
    boardFill: 'solid',
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    category: 'color',
    description: 'Calm purple mist',
    background: 'linear-gradient(180deg, #ede9fe 0%, #c4b5fd 50%, #a78bfa 100%)',
    canvasClass: 'shadow-wall border border-violet-200',
    defaultAccent: '#6d28d9',
    boardColor: 'light-violet',
    boardFill: 'solid',
  },
  mint: {
    id: 'mint',
    label: 'Mint',
    category: 'color',
    description: 'Fresh green breeze',
    background: 'linear-gradient(160deg, #d1fae5 0%, #6ee7b7 50%, #34d399 100%)',
    canvasClass: 'shadow-wall border border-emerald-200',
    defaultAccent: '#047857',
    boardColor: 'light-green',
    boardFill: 'solid',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    category: 'color',
    description: 'Blush pink studio',
    background: 'linear-gradient(145deg, #ffe4e6 0%, #fda4af 50%, #fb7185 100%)',
    canvasClass: 'shadow-wall border border-rose-200',
    defaultAccent: '#be123c',
    boardColor: 'light-red',
    boardFill: 'solid',
  },
  wood: {
    id: 'wood',
    label: 'Wood',
    category: 'color',
    description: 'Walnut grain tones',
    background:
      'repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.03) 12px, rgba(0,0,0,0.03) 13px), linear-gradient(180deg, #a16207 0%, #78350f 50%, #451a03 100%)',
    canvasClass: 'shadow-wall-lg border-4 border-amber-900/40',
    defaultAccent: '#fcd34d',
    boardColor: 'yellow',
    boardFill: 'semi',
  },
  sky: {
    id: 'sky',
    label: 'Sky',
    category: 'color',
    description: 'Open daylight blue',
    background: 'linear-gradient(180deg, #bae6fd 0%, #7dd3fc 40%, #38bdf8 100%)',
    canvasClass: 'shadow-wall border border-sky-200',
    defaultAccent: '#0284c7',
    boardColor: 'light-blue',
    boardFill: 'solid',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    category: 'color',
    description: 'Moss and pine',
    background: 'linear-gradient(160deg, #4ade80 0%, #166534 50%, #14532d 100%)',
    canvasClass: 'shadow-wall-lg border border-green-800/40',
    defaultAccent: '#fef9c3',
    boardColor: 'green',
    boardFill: 'semi',
  },
  paper: {
    id: 'paper',
    label: 'Craft paper',
    category: 'minimal',
    description: 'Kraft texture studio',
    background: 'linear-gradient(180deg, #d6cfc4 0%, #b8a99a 100%)',
    canvasClass: 'shadow-wall border border-amber-900/20',
    defaultAccent: '#92400e',
    boardColor: 'yellow',
    boardFill: 'solid',
  },
  galaxy: {
    id: 'galaxy',
    label: 'Galaxy',
    category: 'dark',
    description: 'Starfield deep space',
    background:
      'radial-gradient(ellipse at 20% 30%, #6366f1 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, #ec4899 0%, transparent 35%), #030712',
    canvasClass: 'border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.2)]',
    defaultAccent: '#c084fc',
    boardColor: 'black',
    boardFill: 'solid',
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber',
    category: 'dark',
    description: 'Grid neon terminal',
    background:
      'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px), #0a0a12',
    workspaceClass: 'wall-theme-dotgrid',
    canvasClass: 'border border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.15)]',
    defaultAccent: '#22d3ee',
    boardColor: 'black',
    boardFill: 'solid',
  },
  coral: {
    id: 'coral',
    label: 'Coral reef',
    category: 'color',
    description: 'Warm peach and teal',
    background: 'linear-gradient(135deg, #ffedd5 0%, #fda4af 40%, #5eead4 100%)',
    canvasClass: 'shadow-wall border border-orange-200/60',
    defaultAccent: '#0d9488',
    boardColor: 'orange',
    boardFill: 'semi',
  },
  zen: {
    id: 'zen',
    label: 'Zen garden',
    category: 'minimal',
    description: 'Calm stone and sand',
    background: 'linear-gradient(180deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%)',
    canvasClass: 'shadow-wall border border-stone-300',
    defaultAccent: '#57534e',
    boardColor: 'grey',
    boardFill: 'solid',
  },
  apricot: {
    id: 'apricot',
    label: 'Apricot',
    category: 'color',
    description: 'Soft peach studio',
    background: 'linear-gradient(160deg, #ffedd5 0%, #fdba74 50%, #fb923c 100%)',
    canvasClass: 'shadow-wall border border-orange-200',
    defaultAccent: '#c2410c',
    boardColor: 'orange',
    boardFill: 'solid',
  },
  terracotta: {
    id: 'terracotta',
    label: 'Terracotta',
    category: 'color',
    description: 'Earthy clay tones',
    background: 'linear-gradient(145deg, #fed7aa 0%, #c2410c 45%, #7c2d12 100%)',
    canvasClass: 'shadow-wall-lg border border-amber-900/30',
    defaultAccent: '#fef3c7',
    boardColor: 'orange',
    boardFill: 'semi',
  },
  arctic: {
    id: 'arctic',
    label: 'Arctic',
    category: 'minimal',
    description: 'Icy blue-white',
    background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 100%)',
    canvasClass: 'shadow-wall border border-sky-200',
    defaultAccent: '#0369a1',
    boardColor: 'light-blue',
    boardFill: 'solid',
  },
  blossom: {
    id: 'blossom',
    label: 'Blossom',
    category: 'color',
    description: 'Cherry blossom pink',
    background: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 50%, #f9a8d4 100%)',
    canvasClass: 'shadow-wall border border-pink-200',
    defaultAccent: '#be185d',
    boardColor: 'light-red',
    boardFill: 'solid',
  },
  comic: {
    id: 'comic',
    label: 'Comic',
    category: 'color',
    description: 'Bold halftone pop art',
    background:
      'radial-gradient(circle, #0a0a0a 2px, transparent 2px), linear-gradient(135deg, #fef08a, #f472b6, #38bdf8)',
    workspaceClass: 'wall-theme-dotgrid',
    canvasClass: 'border-4 border-black shadow-wall-lg',
    defaultAccent: '#ef4444',
    boardColor: 'yellow',
    boardFill: 'solid',
  },
  espresso: {
    id: 'espresso',
    label: 'Espresso',
    category: 'dark',
    description: 'Rich coffee brown',
    background: 'linear-gradient(160deg, #3f2e22 0%, #1c1410 50%, #0c0a09 100%)',
    canvasClass: 'border border-amber-900/50 shadow-wall-lg',
    defaultAccent: '#d97706',
    boardColor: 'black',
    boardFill: 'solid',
  },
}

export const themeList = Object.values(themes)

export function getTheme(id: ThemeId): ThemeConfig {
  const base = themes[id] ?? themes.corkboard
  const page: PageBackgroundStyle = PAGE_BACKGROUNDS[base.id]
  return { ...base, ...page }
}

export function isThemeId(value: string): value is ThemeId {
  return value in themes
}
