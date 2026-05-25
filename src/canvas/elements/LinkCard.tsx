import { ExternalLink } from 'lucide-react'
import type { CanvasElement, LinkContent } from '@/types/canvas'
import { elementStyleToCss } from '@/canvas/elementStyle'
import { cn } from '@/lib/cn'
import { displayAssetUrl } from '@/lib/asset-proxy'

type LinkCardProps = {
  element: CanvasElement
  selected: boolean
  readOnly?: boolean
}

export function LinkCard({ element, selected, readOnly }: LinkCardProps) {
  const content = element.content as LinkContent
  const showUrlLine = content.title !== content.url && !content.image
  const title =
    content.title && content.title !== content.url ? content.title : 'Open link'

  const cardBody = (
    <div className="flex h-full flex-col overflow-hidden p-3 text-[#fafafa]">
      {content.image ? (
        <img
          src={displayAssetUrl(content.image)}
          alt=""
          className="mb-2 max-h-[58%] min-h-[3.5rem] w-full flex-1 rounded-lg object-cover"
          draggable={false}
        />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
          <p className="line-clamp-2 text-sm font-semibold leading-tight">{title}</p>
        </div>
        {content.description ? (
          <p className="line-clamp-2 text-xs text-white/70">{content.description}</p>
        ) : null}
        {showUrlLine ? (
          <p className="mt-auto truncate text-[10px] text-white/45">{content.url}</p>
        ) : null}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'h-full w-full',
        selected && !readOnly && 'ring-2 ring-blue-400/60 ring-offset-1',
      )}
      style={elementStyleToCss(element.style)}
    >
      {readOnly ? (
        <a href={content.url} target="_blank" rel="noopener noreferrer" className="block h-full">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
    </div>
  )
}
