import { useEffect, useRef } from 'react'
import type { CanvasElement, TextContent } from '@/types/canvas'
import { elementStyleToCss } from '@/canvas/elementStyle'
import { cn } from '@/lib/cn'

type TextStickyProps = {
  element: CanvasElement
  selected: boolean
  readOnly?: boolean
  onChange: (text: string) => void
}

export function TextSticky({ element, selected, readOnly, onChange }: TextStickyProps) {
  const content = element.content as TextContent
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selected && !readOnly && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [selected, readOnly])

  return (
    <div
      className={cn(
        'h-full w-full p-3',
        selected && !readOnly && 'ring-2 ring-blue-400/60 ring-offset-1',
      )}
      style={elementStyleToCss(element.style)}
    >
      {readOnly ? (
        <p className="h-full w-full whitespace-pre-wrap break-words text-inherit">{content.text}</p>
      ) : (
        <textarea
          ref={textareaRef}
          className="h-full w-full resize-none bg-transparent text-inherit outline-none placeholder:text-inherit/50"
          value={content.text}
          onChange={(e) => onChange(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Type something..."
        />
      )}
    </div>
  )
}
