import type { ProviderResult } from '@/providers/types'
import { searchCatalogWidgets, WIDGET_CATALOG } from '@/widgets/catalog'

const MUSIC_TEMPLATES = new Set(['spotify', 'soundpad'])

function isMusicWidget(id: string, category: string, template: string) {
  return category === 'music' || MUSIC_TEMPLATES.has(template) || id.includes('spotify') || id.includes('soundpad')
}

export async function searchAudioWidgets(query: string, browse = false): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  const pool = WIDGET_CATALOG.filter((w) => isMusicWidget(w.id, w.category, w.template))

  let matches = pool
  if (q.length >= 2) {
    matches = searchCatalogWidgets(q).filter((w) => isMusicWidget(w.id, w.category, w.template))
  } else if (!browse) {
    return null
  }

  if (matches.length === 0 && browse) {
    matches = pool.slice(0, 16)
  }
  if (matches.length === 0) return null

  return {
    section: {
      id: 'audio-widgets',
      title: 'Music widgets',
      source: 'Spotify embeds · Sound pads · Synth',
      items: matches.slice(0, 16).map((w) => ({
        id: w.id,
        kind: 'widget' as const,
        title: w.name,
        subtitle: w.description,
        icon: w.icon,
        source: 'Library',
        payload: { catalogId: w.id },
      })),
      more: matches.length > 16,
    },
  }
}
