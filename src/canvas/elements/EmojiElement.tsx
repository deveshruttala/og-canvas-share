import type { CanvasElement, EmojiContent } from '@/types/canvas'
import { cn } from '@/lib/cn'

type Props = {
  element: CanvasElement
  selected?: boolean
}

export function EmojiElement({ element, selected }: Props) {
  const { emoji } = element.content as EmojiContent
  const size = element.style.fontSize ?? 64

  return (
    <div
      className={cn(
        'flex h-full w-full select-none items-center justify-center',
        selected && 'ring-2 ring-[var(--accent)] ring-offset-2 rounded-lg',
      )}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {emoji}
    </div>
  )
}
