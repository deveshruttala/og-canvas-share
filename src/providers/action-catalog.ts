import type { OmniItem } from '@/providers/types'
import { wallActions } from '@/editor/wall-actions'
import { useCanvasStore } from '@/store/canvas.store'
import { useUiStore } from '@/store/ui.store'
import { useOmniStore } from '@/store/omni.store'
import { isThemeId, themes } from '@/themes'
import type { ThemeId } from '@/types/canvas'

export type WallActionDef = {
  id: string
  title: string
  subtitle: string
  icon: string
  keywords: string[]
  run: () => void
}

function openOmni(filter?: Parameters<ReturnType<typeof useOmniStore.getState>['setFilter']>[0], query = '') {
  const omni = useOmniStore.getState()
  omni.setOpen(true)
  if (filter) omni.setFilter(filter)
  if (query) omni.setQuery(query)
}

export const WALL_ACTION_CATALOG: WallActionDef[] = [
  {
    id: 'arrange',
    title: 'Auto-arrange layout',
    subtitle: 'Tidy overlapping items on the wall',
    icon: '📐',
    keywords: ['arrange', 'tidy', 'clean', 'layout', 'organize', 'align'],
    run: () => wallActions.autoArrange(),
  },
  {
    id: 'share',
    title: 'Open share modal',
    subtitle: 'Publish or copy your wall link',
    icon: '🔗',
    keywords: ['share', 'publish', 'link', 'copy', 'export'],
    run: () => useUiStore.getState().setShowShareModal(true),
  },
  {
    id: 'undo',
    title: 'Undo',
    subtitle: 'Revert the last edit',
    icon: '↩️',
    keywords: ['undo', 'back', 'revert'],
    run: () => wallActions.undo(),
  },
  {
    id: 'redo',
    title: 'Redo',
    subtitle: 'Reapply undone change',
    icon: '↪️',
    keywords: ['redo', 'forward', 'again'],
    run: () => wallActions.redo(),
  },
  {
    id: 'fit',
    title: 'Fit wall to viewport',
    subtitle: 'Zoom so the whole canvas is visible',
    icon: '🔍',
    keywords: ['fit', 'zoom', 'reset', 'view', 'viewport', 'frame'],
    run: () => wallActions.fitWall(),
  },
  {
    id: 'zoom-in',
    title: 'Zoom in',
    subtitle: 'Magnify the canvas',
    icon: '➕',
    keywords: ['zoom', 'in', 'closer', 'bigger'],
    run: () => wallActions.zoomIn(),
  },
  {
    id: 'zoom-out',
    title: 'Zoom out',
    subtitle: 'See more of the workspace',
    icon: '➖',
    keywords: ['zoom', 'out', 'smaller'],
    run: () => wallActions.zoomOut(),
  },
  {
    id: 'add-text',
    title: 'Add text box',
    subtitle: 'Place editable text on the wall',
    icon: '🔤',
    keywords: ['add', 'text', 'type', 'label', 'title', 'heading'],
    run: () => wallActions.addTextBox(),
  },
  {
    id: 'add-sticky',
    title: 'Add sticky note',
    subtitle: 'Quick yellow note card',
    icon: '📝',
    keywords: ['add', 'sticky', 'note', 'memo'],
    run: () => wallActions.addSticky('Note', 'yellow'),
  },
  {
    id: 'add-image',
    title: 'Search images',
    subtitle: 'Open image search',
    icon: '🖼️',
    keywords: ['add', 'image', 'photo', 'picture', 'search'],
    run: () => openOmni('images', 'nature landscape'),
  },
  {
    id: 'add-gif',
    title: 'Open GIF picker',
    subtitle: 'Animated loops',
    icon: '🎬',
    keywords: ['add', 'gif', 'animation', 'meme'],
    run: () => useUiStore.getState().setShowGifPicker(true),
  },
  {
    id: 'add-emoji',
    title: 'Emoji & sticker picker',
    subtitle: 'Stamp emojis and icons',
    icon: '😀',
    keywords: ['add', 'emoji', 'sticker', 'icon', 'stamp'],
    run: () => useUiStore.getState().setShowEmojiPicker(true),
  },
  {
    id: 'widgets',
    title: 'Browse widget library',
    subtitle: 'Clocks, weather, GitHub, QR, music',
    icon: '🧩',
    keywords: ['widget', 'library', 'clock', 'weather', 'tool'],
    run: () => useUiStore.getState().setShowWidgetPicker(true),
  },
  {
    id: 'connections',
    title: 'Connections & API keys',
    subtitle: 'Pexels, Giphy, Freesound, Coverr video',
    icon: '🔑',
    keywords: ['api', 'key', 'connect', 'provider', 'settings'],
    run: () => useUiStore.getState().setShowConnections(true),
  },
  {
    id: 'themes',
    title: 'Browse canvas themes',
    subtitle: 'Change wall background & mood',
    icon: '🎨',
    keywords: ['theme', 'background', 'style', 'look', 'neon', 'dark'],
    run: () => openOmni('themes', ''),
  },
  {
    id: 'widgets-link',
    title: 'Add service / link',
    subtitle: 'Notion, GitHub, Spotify widgets · paste URL',
    icon: '🔗',
    keywords: ['link', 'url', 'website', 'notion', 'widget', 'card'],
    run: () => openOmni('widgets', ''),
  },
  {
    id: 'audio',
    title: 'Search audio clips',
    subtitle: 'Music and sound effects',
    icon: '🎵',
    keywords: ['audio', 'music', 'sound', 'sfx', 'clip'],
    run: () => openOmni('audio', 'lofi chill'),
  },
  {
    id: 'delete',
    title: 'Delete selected',
    subtitle: 'Remove highlighted items',
    icon: '🗑️',
    keywords: ['delete', 'remove', 'trash', 'clear'],
    run: () => wallActions.deleteSelected(),
  },
  {
    id: 'draw',
    title: 'Draw mode',
    subtitle: 'Sketch on the canvas',
    icon: '✏️',
    keywords: ['draw', 'pen', 'sketch', 'doodle'],
    run: () => {
      useUiStore.getState().setTool('drawing')
      wallActions.setDrawTool()
    },
  },
]

const THEME_ALIASES: Record<string, ThemeId> = {
  dark: 'midnight',
  light: 'whiteboard',
  lime: 'neon',
  space: 'galaxy',
  kraft: 'paper',
  peach: 'apricot',
  coffee: 'espresso',
  ice: 'arctic',
  pink: 'blossom',
  pop: 'comic',
  clay: 'terracotta',
  fridge: 'fridge',
  cork: 'corkboard',
  neon: 'neon',
  galaxy: 'galaxy',
  paper: 'paper',
}

export function matchThemeCommand(query: string): OmniItem | null {
  const q = query.trim().toLowerCase()
  const themeMatch = q.match(/(?:change theme to|theme[:\s]+|set theme\s+)(\w+)/)
  if (!themeMatch) return null
  const raw = (themeMatch[1] ?? '').toLowerCase()
  const id = (THEME_ALIASES[raw] ?? raw) as ThemeId
  if (!isThemeId(id)) return null
  const t = themes[id]
  return {
    id: `action-theme-${id}`,
    kind: 'action',
    title: `Apply theme: ${t.label}`,
    subtitle: t.description,
    icon: '🎨',
    source: 'Wall',
    payload: { run: () => useCanvasStore.getState().setTheme(id) },
  }
}

export function scoreAction(def: WallActionDef, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const hay = `${def.title} ${def.subtitle} ${def.keywords.join(' ')}`.toLowerCase()
  let score = 0
  const tokens = q.split(/\s+/).filter(Boolean)
  for (const t of tokens) {
    if (def.title.toLowerCase().startsWith(t)) score += 5
    if (hay.includes(t)) score += 3
    if (def.keywords.some((k) => k.startsWith(t) || k.includes(t))) score += 2
    if (t.length === 1 && hay.includes(t)) score += 1
  }
  return score
}

export function actionDefToItem(def: WallActionDef): OmniItem {
  return {
    id: `action-${def.id}`,
    kind: 'action',
    title: def.title,
    subtitle: def.subtitle,
    icon: def.icon,
    source: 'Wall',
    payload: { run: def.run },
  }
}

export function searchActionCatalog(query: string, browse = false): OmniItem[] {
  const q = query.trim().toLowerCase()
  if (browse || !q) {
    return WALL_ACTION_CATALOG.map(actionDefToItem)
  }

  const scored = WALL_ACTION_CATALOG.map((def) => ({ def, score: scoreAction(def, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return WALL_ACTION_CATALOG.slice(0, 10).map(actionDefToItem)
  }
  return scored.map((r) => actionDefToItem(r.def))
}
