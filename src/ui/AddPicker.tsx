import {
  Type,
  Image,
  Film,
  Smile,
  Link2,
  Music,
  Mic,
  Pencil,
  QrCode,
  Clock,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { wallActions } from '@/editor/wall-actions'

export function AddPicker() {
  const open = useUiStore((s) => s.showAddPicker)
  const setOpen = useUiStore((s) => s.setShowAddPicker)
  const setShowGifPicker = useUiStore((s) => s.setShowGifPicker)
  const setShowEmojiPicker = useUiStore((s) => s.setShowEmojiPicker)
  const setShowIconPicker = useUiStore((s) => s.setShowIconPicker)

  if (!open) return null

  const pickAudio = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      await wallActions.addAudioFromFile(file)
    }
    input.click()
  }

  const items = [
    { icon: Type, label: 'Sticky', action: () => wallActions.addSticky() },
    {
      icon: Image,
      label: 'Image',
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (!file) return
          await wallActions.addImageFromFile(file)
        }
        input.click()
      },
    },
    {
      icon: Film,
      label: 'GIF',
      action: () => {
        setOpen(false)
        setShowGifPicker(true)
      },
    },
    {
      icon: Smile,
      label: 'Emoji',
      action: () => {
        setOpen(false)
        setShowEmojiPicker(true)
      },
    },
    {
      icon: Star,
      label: 'Icon',
      action: () => {
        setOpen(false)
        setShowIconPicker(true)
      },
    },
    {
      icon: Link2,
      label: 'Link',
      action: async () => {
        const url = window.prompt('Paste URL')
        if (url) await wallActions.addLink(url)
      },
    },
    { icon: Music, label: 'Audio', action: pickAudio },
    { icon: Mic, label: 'Voice', action: pickAudio },
    {
      icon: Pencil,
      label: 'Draw',
      action: () => {
        useUiStore.getState().setTool('drawing')
        wallActions.setDrawTool()
      },
    },
    {
      icon: QrCode,
      label: 'QR',
      action: async () => {
        const url = window.prompt('URL for QR')
        if (url) await wallActions.addQr(url)
      },
    },
    { icon: Clock, label: 'Widget', action: () => wallActions.addWidget('clock') },
    { icon: Sparkles, label: 'Weather', action: () => wallActions.addWidget('weather') },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-end sm:pb-28">
      <div className="w-full max-w-md rounded-[var(--r-xl)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-lg)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Add to your wall</h3>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-[var(--bg-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {items.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                action()
                setOpen(false)
              }}
              className="flex flex-col items-center gap-2 rounded-[14px] bg-[var(--bg-subtle)] p-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <Icon className="h-6 w-6 text-[var(--text-primary)]" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
          Or paste anything — we&apos;ll figure out the rest.
        </p>
      </div>
    </div>
  )
}
