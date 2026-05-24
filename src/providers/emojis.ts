import type { ProviderResult } from '@/providers/types'

const EMOJI_DATA: Array<{ emoji: string; name: string; tags: string[] }> = [
  { emoji: '🌅', name: 'sunrise', tags: ['sun', 'sunset', 'morning'] },
  { emoji: '☀️', name: 'sun', tags: ['sunny', 'weather', 'bright'] },
  { emoji: '🌄', name: 'sunrise mountains', tags: ['sunset', 'nature'] },
  { emoji: '🌇', name: 'city sunset', tags: ['sunset', 'city'] },
  { emoji: '🔥', name: 'fire', tags: ['hot', 'lit', 'trending'] },
  { emoji: '❤️', name: 'heart', tags: ['love', 'like'] },
  { emoji: '🚀', name: 'rocket', tags: ['launch', 'space', 'startup'] },
  { emoji: '💻', name: 'laptop', tags: ['code', 'dev', 'tech'] },
  { emoji: '🎵', name: 'music', tags: ['audio', 'song', 'spotify'] },
  { emoji: '🎉', name: 'party', tags: ['celebrate', 'fun'] },
  { emoji: '☕', name: 'coffee', tags: ['cafe', 'morning', 'buy me a coffee'] },
  { emoji: '🐦', name: 'bird', tags: ['twitter', 'social'] },
  { emoji: '💼', name: 'briefcase', tags: ['work', 'resume', 'job'] },
  { emoji: '📌', name: 'pin', tags: ['note', 'sticky'] },
  { emoji: '✨', name: 'sparkles', tags: ['magic', 'new', 'aesthetic'] },
  { emoji: '🌈', name: 'rainbow', tags: ['pride', 'colorful'] },
  { emoji: '🎨', name: 'art', tags: ['design', 'creative'] },
  { emoji: '📸', name: 'camera', tags: ['photo', 'picture'] },
  { emoji: '🌤️', name: 'partly sunny', tags: ['weather'] },
  { emoji: '🌙', name: 'moon', tags: ['night', 'sleep'] },
  { emoji: '⭐', name: 'star', tags: ['favorite', 'rating'] },
  { emoji: '👾', name: 'alien', tags: ['retro', 'arcade', 'game'] },
  { emoji: '🥑', name: 'avocado', tags: ['food', 'healthy'] },
  { emoji: '🍕', name: 'pizza', tags: ['food', 'fun'] },
  { emoji: '🎮', name: 'gamepad', tags: ['gaming', 'play'] },
  { emoji: '📈', name: 'chart up', tags: ['stocks', 'growth', 'stats'] },
  { emoji: '🏃', name: 'runner', tags: ['fitness', 'strava', 'health'] },
  { emoji: '🧘', name: 'meditation', tags: ['calm', 'wellness'] },
  { emoji: '🔗', name: 'link', tags: ['url', 'website'] },
  { emoji: '🎁', name: 'gift', tags: ['birthday', 'present'] },
]

function score(entry: (typeof EMOJI_DATA)[0], q: string): number {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  let s = 0
  for (const t of terms) {
    if (entry.name.includes(t)) s += 3
    if (entry.tags.some((tag) => tag.includes(t))) s += 2
    if (entry.emoji === q) s += 5
  }
  return s
}

export async function searchEmojis(query: string): Promise<ProviderResult | null> {
  const q = query.trim()
  if (!q) return null

  const ranked = EMOJI_DATA.map((e) => ({ e, s: score(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 14)

  const items =
    ranked.length > 0
      ? ranked.map(({ e }) => ({
          id: `emoji-${e.emoji}`,
          kind: 'emoji' as const,
          title: e.name,
          emoji: e.emoji,
          source: 'Unicode',
        }))
      : EMOJI_DATA.slice(0, 14).map((e) => ({
          id: `emoji-${e.emoji}`,
          kind: 'emoji' as const,
          title: e.name,
          emoji: e.emoji,
          source: 'Unicode',
        }))

  return {
    section: {
      id: 'emojis',
      title: 'Emojis & icons',
      source: 'Local',
      items,
    },
  }
}

export async function searchIcons(query: string): Promise<ProviderResult | null> {
  const q = query.trim().toLowerCase()
  if (!q || (!/\bicon\b/.test(q) && q.length < 2)) return null

  const icons = ['⚡', '🔔', '📊', '🎯', '💡', '🛡️', '📱', '🌍', '🎬', '📝', '🔒', '📡']

  return {
    section: {
      id: 'icons',
      title: 'Icon stickers',
      source: 'Lucide-style',
      items: icons.slice(0, 12).map((icon, i) => ({
        id: `icon-${i}-${icon}`,
        kind: 'icon' as const,
        title: `Icon ${icon}`,
        icon,
        source: 'Icons',
      })),
    },
  }
}
