import { useState } from 'react'
import type { CanvasElement } from '@/types/canvas'
import { displayAssetUrl } from '@/lib/asset-proxy'

type Props = {
  element: CanvasElement
  readOnly?: boolean
  onCaptionChange?: (caption: string) => void
}

export function PolaroidElement({ element, readOnly, onCaptionChange }: Props) {
  const data = element.content as { src?: string; caption?: string }
  const [caption, setCaption] = useState(data.caption ?? 'Write a caption…')

  return (
    <div className="wall-polaroid flex h-full w-full flex-col bg-[#faf8f5] p-3 shadow-2xl">
      <div className="relative flex-1 overflow-hidden bg-neutral-900">
        {data.src ? (
          <img
            src={displayAssetUrl(data.src)}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600 text-xs">No image</div>
        )}
      </div>
      {readOnly ? (
        <p className="wall-polaroid-caption mt-3 text-center font-serif text-sm text-neutral-700">{caption}</p>
      ) : (
        <input
          type="text"
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value)
            onCaptionChange?.(e.target.value)
          }}
          className="wall-polaroid-caption mt-3 w-full border-none bg-transparent text-center font-serif text-sm text-neutral-700 outline-none"
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}
    </div>
  )
}
