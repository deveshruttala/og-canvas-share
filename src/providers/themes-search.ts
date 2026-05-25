import type { OmniItem, ProviderResult } from '@/providers/types'
import { themes, THEME_CATEGORIES } from '@/themes'
import { loadCommunityThemes } from '@/themes/community-theme'
import type { ThemeId } from '@/types/canvas'
import { useCanvasStore } from '@/store/canvas.store'

const CATEGORY_EMOJI: Record<string, string> = {
  classic: '📌',
  minimal: '⬜',
  dark: '🌙',
  color: '🌈',
}

function scoreTheme(
  t: (typeof themes)[ThemeId],
  q: string,
): number {
  const hay = `${t.label} ${t.id} ${t.description} ${t.category}`.toLowerCase()
  let score = 0
  const tokens = q.split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    if (t.label.toLowerCase().startsWith(token)) score += 5
    if (t.id.includes(token)) score += 4
    if (hay.includes(token)) score += 3
    if (token.length === 1 && hay.includes(token)) score += 1
  }
  return score
}

export async function searchThemes(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  const all = Object.values(themes)

  let filtered = all
  if (browse || !q) {
    filtered = all
  } else {
    const scored = all
      .map((t) => ({ t, score: scoreTheme(t, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.t)
    filtered = scored.length ? scored : all.filter((t) => scoreTheme(t, q.slice(0, 1)) > 0)
    if (filtered.length === 0) filtered = all
  }

  const community = await loadCommunityThemes()
  const communityFiltered =
    browse || !q
      ? community
      : community.filter((t) => {
          const hay = `${t.label} ${t.id} ${t.description ?? ''}`.toLowerCase()
          return q.split(/\s+/).filter(Boolean).some((tok) => hay.includes(tok))
        })

  const items: OmniItem[] = filtered.map((t) => ({
    id: `theme-${t.id}`,
    kind: 'action' as const,
    title: t.label,
    subtitle: `${THEME_CATEGORIES.find((c) => c.id === t.category)?.label ?? t.category} · ${t.description}`,
    icon: CATEGORY_EMOJI[t.category] ?? '🎨',
    source: t.category,
    payload: {
      run: () => useCanvasStore.getState().setTheme(t.id as ThemeId),
    },
  }))

  const communityItems: OmniItem[] = communityFiltered.map((t) => ({
    id: `theme-community-${t.id}`,
    kind: 'action' as const,
    title: t.label,
    subtitle: t.description ?? 'Community JSON theme',
    icon: '🌐',
    source: 'Community',
    payload: {
      run: () =>
        useCanvasStore.getState().applyCommunityTheme({
          id: t.id,
          workspaceBackground: t.workspaceBackground,
          pageBackground: t.pageBackground,
          pageBackgroundSize: t.pageBackgroundSize,
          defaultAccent: t.defaultAccent,
        }),
    },
  }))

  const merged = [...communityItems, ...items]

  return {
    section: {
      id: 'themes',
      title: 'Canvas themes',
      source: `${all.length} built-in · ${community.length} community`,
      items: merged.slice(0, 40),
      more: merged.length > 40,
    },
  }
}
