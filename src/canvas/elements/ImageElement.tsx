import type { CanvasElement, ImageContent } from '@/types/canvas'
import { elementStyleToCss } from '@/canvas/elementStyle'
import { cn } from '@/lib/cn'

type ImageElementProps = {
  element: CanvasElement
  selected: boolean
  readOnly?: boolean
}

export function ImageElement({ element, selected, readOnly }: ImageElementProps) {
  const content = element.content as ImageContent

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden',
        selected && !readOnly && 'ring-2 ring-blue-400/60 ring-offset-1',
      )}
      style={elementStyleToCss(element.style)}
    >
      <img
        src={content.src}
        alt={content.alt ?? ''}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  )
}
