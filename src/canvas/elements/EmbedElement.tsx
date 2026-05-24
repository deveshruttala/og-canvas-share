import type { CanvasElement, EmbedContent } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { platformLabel } from '@/lib/link-resolver'

type Props = {
  element: CanvasElement
  selected?: boolean
}

export function EmbedElement({ element, selected }: Props) {
  const { embedUrl, platform } = element.content as EmbedContent

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden',
        selected && 'ring-2 ring-[var(--accent)] ring-offset-2',
      )}
      style={{
        borderRadius: element.style.borderRadius ?? 12,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-center gap-2 border-b border-black/10 bg-[var(--bg-subtle)] px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {platformLabel(platform as Parameters<typeof platformLabel>[0])}
        </span>
      </div>
      <iframe
        src={embedUrl}
        title="Media embed"
        className="min-h-0 flex-1 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  )
}
