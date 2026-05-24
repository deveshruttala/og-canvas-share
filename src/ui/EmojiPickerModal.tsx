import { useState } from 'react'
import { X } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { wallActions } from '@/editor/wall-actions'
import { cn } from '@/lib/cn'

const CATEGORIES = [
  { id: 'tech', label: 'Tech & Dev', icon: '💻', emojis: ['💻', '⚡', '🚀', '🔧', '📦', '🛠️', '🤖', '⌨️'] },
  { id: 'reactions', label: 'Reactions', icon: '🔥', emojis: ['🔥', '❤️', '👏', '🎉', '🤯', '😂', '💯', '⭐'] },
  { id: 'retro', label: 'Retro Arcade', icon: '👾', emojis: ['👾', '🕹️', '👻', '🟡', '🔴', '🟢', '💎', '🎯'] },
  { id: 'aesthetic', label: 'Aesthetics', icon: '✨', emojis: ['✨', '🌈', '🌸', '🦋', '💫', '🌙', '☁️', '🎨'] },
  { id: 'food', label: 'Food & Mood', icon: '🥑', emojis: ['🥑', '☕', '🍕', '🍩', '🧋', '🌮', '🍜', '🍓'] },
] as const

export function EmojiPickerModal() {
  const open = useUiStore((s) => s.showEmojiPicker)
  const setOpen = useUiStore((s) => s.setShowEmojiPicker)
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('tech')

  if (!open) return null

  const active = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0]

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-md sm:items-center">
      <div className="wall-emoji-drawer w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <p className="text-sm font-black uppercase tracking-wider text-[#beee1d]">Sticker & Emoji Stamps</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10">
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-neutral-800 px-2 py-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition',
                category === cat.id
                  ? 'bg-[#beee1d] text-black'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-8">
          {active.emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="wall-emoji-stamp flex h-14 items-center justify-center rounded-xl text-2xl transition hover:scale-110 hover:bg-[#beee1d]/10 active:scale-95"
              onClick={() => {
                wallActions.addEmoji(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
