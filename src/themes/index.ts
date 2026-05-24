import type { ThemeId } from '@/types/canvas'

export type { ThemeId }

export type ThemeConfig = {
  id: ThemeId
  label: string
  background: string
  canvasClass: string
  defaultAccent: string
}

export const themes: Record<ThemeId, ThemeConfig> = {
  corkboard: {
    id: 'corkboard',
    label: 'Corkboard',
    background:
      'radial-gradient(ellipse at 30% 20%, #c4a574 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #8b6914 0%, transparent 40%), linear-gradient(145deg, #b8956a 0%, #8f6b3d 50%, #6b4f2a 100%)',
    canvasClass: 'shadow-wall-lg',
    defaultAccent: '#e8a838',
  },
  whiteboard: {
    id: 'whiteboard',
    label: 'Whiteboard',
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    canvasClass: 'shadow-wall border border-slate-200',
    defaultAccent: '#3b82f6',
  },
  glass: {
    id: 'glass',
    label: 'Glass',
    background:
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    canvasClass: 'backdrop-blur-md bg-white/20 border border-white/30 shadow-wall-lg',
    defaultAccent: '#a78bfa',
  },
  fridge: {
    id: 'fridge',
    label: 'Fridge',
    background: 'linear-gradient(180deg, #e8f4fc 0%, #d0e8f5 100%)',
    canvasClass: 'shadow-wall border border-slate-300/50',
    defaultAccent: '#ef4444',
  },
  locker: {
    id: 'locker',
    label: 'Locker',
    background: 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
    canvasClass: 'shadow-wall-lg border-4 border-slate-600',
    defaultAccent: '#fbbf24',
  },
  notebook: {
    id: 'notebook',
    label: 'Notebook',
    background:
      'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px), #fffef9',
    canvasClass: 'shadow-wall border-l-4 border-red-300',
    defaultAccent: '#dc2626',
  },
  black: {
    id: 'black',
    label: 'Pure black',
    background: '#0a0a0a',
    canvasClass: 'border border-neutral-800',
    defaultAccent: '#fafafa',
  },
  white: {
    id: 'white',
    label: 'Pure white',
    background: '#fafafa',
    canvasClass: 'border border-neutral-200 shadow-wall',
    defaultAccent: '#0a0a0a',
  },
}

export function getTheme(id: ThemeId): ThemeConfig {
  return themes[id] ?? themes.corkboard
}
