export type EmojiEntry = { emoji: string; name: string; tags: string[] }

export const EMOJI_PICKER_CATEGORIES = [
  {
    id: 'faces',
    label: 'Faces',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '🥹', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘',
      '😎', '🤓', '🧐', '🤔', '🫡', '🤯', '😱', '😭', '😤', '😡', '🥳', '🤩', '😴', '🤤', '😈', '👻',
    ],
  },
  {
    id: 'tech',
    label: 'Tech & Dev',
    icon: '💻',
    emojis: [
      '💻', '⚡', '🚀', '🔧', '📦', '🛠️', '🤖', '⌨️', '🖥️', '📱', '🔌', '💾', '🧑‍💻', '🌐', '📡', '🔒',
      '💿', '🖨️', '📟', '🔋', '🎛️', '🧲', '🔬', '🧪', '🛰️', '📶', '🖱️', '💽', '🗄️', '🔐',
    ],
  },
  {
    id: 'reactions',
    label: 'Reactions',
    icon: '🔥',
    emojis: [
      '🔥', '❤️', '👏', '🎉', '🤯', '😂', '💯', '⭐', '👍', '👎', '🙌', '💪', '😍', '🥳', '😎', '🤝',
      '✌️', '🤞', '🫶', '❤️‍🔥', '💔', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
    ],
  },
  {
    id: 'retro',
    label: 'Retro & Games',
    icon: '👾',
    emojis: ['👾', '🕹️', '👻', '🟡', '🔴', '🟢', '💎', '🎯', '🏆', '🎲', '🃏', '⚔️', '🛸', '📼', '🎮', '🕶️'],
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    icon: '✨',
    emojis: ['✨', '🌈', '🌸', '🦋', '💫', '🌙', '☁️', '🎨', '🌺', '🪷', '💜', '🩵', '🩷', '🌊', '🌅', '🌇'],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: '🥑',
    emojis: ['🥑', '☕', '🍕', '🍩', '🧋', '🌮', '🍜', '🍓', '🍔', '🥗', '🍣', '🍷', '🍺', '🧁', '🍪', '🥤'],
  },
  {
    id: 'work',
    label: 'Work & Biz',
    icon: '💼',
    emojis: ['💼', '📊', '📈', '📉', '💰', '🏢', '📝', '📅', '✅', '📌', '🎯', '💡', '📣', '🤝', '🧾', '⏰'],
  },
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌿',
    emojis: ['🌿', '🌳', '🌻', '🐶', '🐱', '🦊', '🐻', '🦁', '🐼', '🐧', '🦋', '🌵', '🍀', '⛰️', '🏖️', '🌋'],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: '✈️',
    emojis: ['✈️', '🚂', '🚗', '🚲', '🗺️', '🧳', '🏝️', '🗽', '🗼', '🏔️', '⛺', '🚢', '🛫', '🌍', '🌏', '🎒'],
  },
  {
    id: 'music',
    label: 'Music',
    icon: '🎵',
    emojis: ['🎵', '🎶', '🎸', '🎹', '🥁', '🎤', '🎧', '📻', '🎺', '🎻', '🪩', '🎼', '🔊', '🔇', '📀', '🎙️'],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: '⚡',
    emojis: ['⚡', '✅', '❌', '❓', '❗', '➡️', '⬆️', '⬇️', '♻️', '🔔', '🔕', '💬', '📎', '🔗', '⭕', '🔶', '🔷', '🔺', '⏸️', '▶️'],
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏊', '🚴', '🏋️', '🤸', '⛷️', '🏂', '🛹'],
  },
  {
    id: 'animals',
    label: 'Animals',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦉', '🐝', '🦋'],
  },
  {
    id: 'holidays',
    label: 'Holidays',
    icon: '🎄',
    emojis: ['🎄', '🎃', '🎆', '🎇', '🧨', '🎁', '🎂', '🎈', '🪅', '🎊', '🎋', '🕯️', '🪔', '❄️', '☃️', '🧧', '🐉', '🥮', '🍾', '🎭'],
  },
  {
    id: 'flags',
    label: 'Places',
    icon: '🌍',
    emojis: ['🌍', '🌎', '🌏', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇯🇵', '🇮🇳', '🇧🇷', '🇨🇦', '🇦🇺', '🇮🇹', '🇪🇸', '🇰🇷', '🇲🇽', '🇸🇬', '🇦🇪', '🇿🇦', '🇳🇱'],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '🔨',
    emojis: ['🔨', '🪛', '🔩', '⚙️', '🧲', '🔬', '🔭', '🧪', '🧯', '🪜', '🧰', '🗜️', '✂️', '📏', '📐', '🖊️', '✏️', '🖌️', '📎', '🗂️'],
  },
] as const

/** Flat searchable library for omni + search scoring. */
export const EMOJI_LIBRARY: EmojiEntry[] = [
  ...EMOJI_PICKER_CATEGORIES.flatMap((cat) =>
    cat.emojis.map((emoji) => ({
      emoji,
      name: cat.label.toLowerCase(),
      tags: [cat.id, cat.label.toLowerCase(), ...cat.label.split(/\s+/)],
    })),
  ),
  { emoji: '🌅', name: 'sunrise', tags: ['sun', 'sunset', 'morning', 'nature'] },
  { emoji: '☀️', name: 'sun', tags: ['sunny', 'weather', 'bright'] },
  { emoji: '🌄', name: 'sunrise mountains', tags: ['sunset', 'nature', 'landscape'] },
  { emoji: '🌇', name: 'city sunset', tags: ['sunset', 'city', 'urban'] },
  { emoji: '🔥', name: 'fire', tags: ['hot', 'lit', 'trending'] },
  { emoji: '❤️', name: 'heart', tags: ['love', 'like', 'valentine'] },
  { emoji: '🚀', name: 'rocket', tags: ['launch', 'space', 'startup'] },
  { emoji: '💻', name: 'laptop', tags: ['code', 'dev', 'tech'] },
  { emoji: '🎵', name: 'music note', tags: ['audio', 'song', 'spotify'] },
  { emoji: '🎉', name: 'party', tags: ['celebrate', 'fun', 'birthday'] },
  { emoji: '☕', name: 'coffee', tags: ['cafe', 'morning', 'drink'] },
  { emoji: '🐦', name: 'bird', tags: ['twitter', 'social', 'nature'] },
  { emoji: '💼', name: 'briefcase', tags: ['work', 'resume', 'job'] },
  { emoji: '📌', name: 'pin', tags: ['note', 'sticky', 'bookmark'] },
  { emoji: '✨', name: 'sparkles', tags: ['magic', 'new', 'aesthetic'] },
  { emoji: '🌈', name: 'rainbow', tags: ['pride', 'colorful'] },
  { emoji: '🎨', name: 'palette', tags: ['design', 'creative', 'art'] },
  { emoji: '📸', name: 'camera', tags: ['photo', 'picture'] },
  { emoji: '🌤️', name: 'partly sunny', tags: ['weather', 'cloud'] },
  { emoji: '🌙', name: 'moon', tags: ['night', 'sleep'] },
  { emoji: '⭐', name: 'star', tags: ['favorite', 'rating'] },
  { emoji: '👾', name: 'alien monster', tags: ['retro', 'arcade', 'game'] },
  { emoji: '🥑', name: 'avocado', tags: ['food', 'healthy'] },
  { emoji: '🍕', name: 'pizza', tags: ['food', 'fun'] },
  { emoji: '🎮', name: 'gamepad', tags: ['gaming', 'play'] },
  { emoji: '📈', name: 'chart increasing', tags: ['stocks', 'growth', 'stats'] },
  { emoji: '🏃', name: 'runner', tags: ['fitness', 'strava', 'health'] },
  { emoji: '🧘', name: 'meditation', tags: ['calm', 'wellness', 'yoga'] },
  { emoji: '🔗', name: 'link', tags: ['url', 'website'] },
  { emoji: '🎁', name: 'gift', tags: ['birthday', 'present'] },
  { emoji: '😀', name: 'grinning', tags: ['happy', 'smile', 'face'] },
  { emoji: '😭', name: 'crying', tags: ['sad', 'face'] },
  { emoji: '🤔', name: 'thinking', tags: ['hmm', 'question'] },
  { emoji: '🙏', name: 'pray', tags: ['thanks', 'please'] },
  { emoji: '👀', name: 'eyes', tags: ['look', 'watch'] },
  { emoji: '💀', name: 'skull', tags: ['dead', 'spooky', 'lol'] },
  { emoji: '🦄', name: 'unicorn', tags: ['magic', 'startup'] },
  { emoji: '🌮', name: 'taco', tags: ['food', 'mexican'] },
  { emoji: '🏠', name: 'house', tags: ['home', 'real estate'] },
  { emoji: '🎓', name: 'graduation', tags: ['school', 'education'] },
  { emoji: '🏥', name: 'hospital', tags: ['health', 'medical'] },
  { emoji: '⚽', name: 'soccer', tags: ['sport', 'football'] },
  { emoji: '🏀', name: 'basketball', tags: ['sport'] },
  { emoji: '🎾', name: 'tennis', tags: ['sport'] },
  { emoji: '🛒', name: 'cart', tags: ['shop', 'ecommerce'] },
  { emoji: '📚', name: 'books', tags: ['read', 'study'] },
  { emoji: '🔮', name: 'crystal ball', tags: ['magic', 'future'] },
  { emoji: '🧱', name: 'brick', tags: ['wall', 'build'] },
  { emoji: '🌱', name: 'seedling', tags: ['grow', 'eco', 'plant'] },
  { emoji: '♻️', name: 'recycle', tags: ['eco', 'green'] },
  { emoji: '🆕', name: 'new', tags: ['badge', 'update'] },
  { emoji: '🆓', name: 'free', tags: ['badge'] },
  { emoji: '🔴', name: 'red circle', tags: ['live', 'recording'] },
  { emoji: '🟢', name: 'green circle', tags: ['online', 'available'] },
  { emoji: '🤖', name: 'robot', tags: ['ai', 'bot', 'tech'] },
  { emoji: '🧠', name: 'brain', tags: ['ai', 'think', 'smart'] },
  { emoji: '👑', name: 'crown', tags: ['vip', 'winner', 'premium'] },
  { emoji: '💎', name: 'gem', tags: ['premium', 'luxury'] },
  { emoji: '📣', name: 'megaphone', tags: ['announce', 'marketing'] },
  { emoji: '🛡️', name: 'shield', tags: ['security', 'safe'] },
  { emoji: '☂️', name: 'umbrella', tags: ['rain', 'weather'] },
  { emoji: '🌡️', name: 'thermometer', tags: ['hot', 'weather'] },
  { emoji: '⏳', name: 'hourglass', tags: ['wait', 'time'] },
  { emoji: '⌛', name: 'timer', tags: ['deadline', 'time'] },
]

export const ICON_STICKER_SET = [
  '⚡', '🔔', '📊', '🎯', '💡', '🛡️', '📱', '🌍', '🎬', '📝', '🔒', '📡', '⭐', '🔥', '💎', '🏆',
  '🎁', '🧩', '🔑', '📎', '🧭', '⏱️', '🎤', '🛒', '✅', '❌', '❓', '❗', '➕', '➖', '✖️', '➗',
  '♻️', '💬', '🔗', '📌', '📍', '🏠', '☁️', '🌙', '☀️', '🎵', '🎮', '👾', '🚀', '💻', '📷',
  '⚠️', '🔍', '📧', '📞', '👑', '✨', '🎓', '💼', '🗂️', '📁', '🔋', '🧪', '⬆️', '⬇️', '➡️', '⬅️',
] as const

export const EMOJI_PICKER_TOTAL = EMOJI_PICKER_CATEGORIES.reduce((n, c) => n + c.emojis.length, 0)

function dedupeByEmoji(entries: EmojiEntry[]): EmojiEntry[] {
  const seen = new Set<string>()
  return entries.filter((e) => {
    if (seen.has(e.emoji)) return false
    seen.add(e.emoji)
    return true
  })
}

export const EMOJI_LIBRARY_UNIQUE = dedupeByEmoji(EMOJI_LIBRARY)

export function scoreEmoji(entry: EmojiEntry, q: string): number {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  let s = 0
  for (const t of terms) {
    if (entry.name.includes(t)) s += 3
    if (entry.tags.some((tag) => tag.includes(t))) s += 2
    if (entry.emoji === q) s += 5
  }
  return s
}

export function searchEmojiLibrary(query: string, limit = 40): EmojiEntry[] {
  const q = query.trim()
  if (!q) return EMOJI_LIBRARY_UNIQUE.slice(0, limit)
  const ranked = EMOJI_LIBRARY_UNIQUE.map((e) => ({ e, s: scoreEmoji(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
  if (ranked.length > 0) return ranked.slice(0, limit).map((x) => x.e)
  return EMOJI_LIBRARY_UNIQUE.slice(0, limit)
}
