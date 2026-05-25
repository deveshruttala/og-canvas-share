import type { ProviderResult } from '@/providers/types'
import { wallActions } from '@/editor/wall-actions'
import { useCanvasStore } from '@/store/canvas.store'
import { useUiStore } from '@/store/ui.store'
import { useOmniStore } from '@/store/omni.store'
import { isThemeId, themes } from '@/themes'

function runAction(label: string, run: () => void) {
  return {
    id: `action-${label}`,
    kind: 'action' as const,
    title: label,
    source: 'Wall',
    payload: { run },
  }
}

export async function inferActions(query: string): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const items: ReturnType<typeof runAction>[] = []

  const themeAliases: Record<string, string> = {
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
  }

  const themeMatch = q.match(/change theme to (\w+)|theme[:\s]+(\w+)/)
  if (themeMatch) {
    const raw = (themeMatch[1] ?? themeMatch[2] ?? '').toLowerCase()
    const id = (themeAliases[raw] ?? raw) as string
    if (isThemeId(id)) {
      items.push(
        runAction(`Change theme to "${themes[id].label}"`, () => {
          useCanvasStore.getState().setTheme(id)
        }),
      )
    }
  }

  if (/\b(clean up|tidy|arrange)\b/.test(q)) {
    items.push(runAction('Auto-arrange layout', () => wallActions.autoArrange()))
  }

  if (/\bshare\b|\bcopy link\b/.test(q)) {
    items.push(runAction('Open share modal', () => useUiStore.getState().setShowShareModal(true)))
  }

  if (/\bundo\b/.test(q)) {
    items.push(runAction('Undo last change', () => wallActions.undo()))
  }

  if (/\bfit\b|\breset zoom\b/.test(q)) {
    items.push(runAction('Fit wall to viewport', () => wallActions.fitWall()))
  }

  const widgetPicker = /\bwidget\b|\bbrowse library\b/.test(q)
  if (widgetPicker) {
    items.push(runAction('Browse widget library', () => useUiStore.getState().setShowWidgetPicker(true)))
  }

  if (/\bemoji\b|\bsticker\b/.test(q)) {
    items.push(runAction('Open emoji & sticker picker', () => useUiStore.getState().setShowEmojiPicker(true)))
  }

  if (/\bgif\b/.test(q)) {
    items.push(runAction('Open GIF picker', () => useUiStore.getState().setShowGifPicker(true)))
  }

  const addMatch = q.match(/^add (?:a |an )?(.+)/)
  if (addMatch?.[1]) {
    const topic = addMatch[1]
    items.push(
      runAction(`Search images for "${topic}"`, () => {
        useOmniStore.getState().setOpen(true)
        useOmniStore.getState().setQuery(topic)
      }),
    )
  }

  if (items.length === 0) return null

  return {
    section: {
      id: 'actions',
      title: 'Suggested actions',
      source: 'Wall',
      items: items.slice(0, 6),
    },
  }
}
