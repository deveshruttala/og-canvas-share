import { ExternalLink } from 'lucide-react'
import { isAllowedEmbedIframeHost } from '@/lib/normalize-wall-url'
import { isEmbeddableUrl } from '@/lib/link-resolver'
import { detectLinkPlatform, platformLabel } from '@/lib/link-resolver'
import { cn } from '@/lib/cn'
import { displayAssetUrl } from '@/lib/asset-proxy'

type LinkPreview = {
  url: string
  title?: string
  description?: string
  image?: string
}

type Props = {
  embedUrl: string
  originalUrl?: string
  linkPreview?: LinkPreview
  selected?: boolean
  readOnly?: boolean
}

export function WallEmbedFrame({
  embedUrl,
  originalUrl,
  linkPreview,
  selected,
  readOnly,
}: Props) {
  const showIframe = isAllowedEmbedIframeHost(embedUrl) && isEmbeddableUrl(embedUrl)
  const label = platformLabel(detectLinkPlatform(originalUrl ?? embedUrl))

  if (!showIframe) {
    const preview = linkPreview ?? { url: originalUrl ?? embedUrl, title: originalUrl ?? embedUrl }
    const title = preview.title && preview.title !== preview.url ? preview.title : 'Open link'
    const body = (
      <div className="flex h-full flex-col overflow-hidden p-3 text-[#fafafa]">
        {preview.image ? (
          <img
            src={displayAssetUrl(preview.image)}
            alt=""
            className="mb-2 max-h-[55%] min-h-[3rem] w-full flex-1 rounded-lg object-cover"
            draggable={false}
          />
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col gap-1">
          <div className="flex items-start gap-2">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
            <p className="line-clamp-2 text-sm font-semibold leading-tight">{title}</p>
          </div>
          {preview.description ? (
            <p className="line-clamp-2 text-xs text-white/70">{preview.description}</p>
          ) : null}
          <p className="mt-auto truncate text-[10px] text-white/45">{preview.url}</p>
        </div>
      </div>
    )

    return (
      <div
        className={cn(
          'wall-embed-frame wall-embed-frame--link h-full w-full',
          selected && 'ring-2 ring-[#beee1d]/70 ring-offset-1',
        )}
      >
        {readOnly ? (
          <a href={preview.url} target="_blank" rel="noopener noreferrer" className="block h-full">
            {body}
          </a>
        ) : (
          body
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'wall-embed-frame flex h-full w-full flex-col overflow-hidden',
        selected && 'ring-2 ring-[#beee1d]/70 ring-offset-1',
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1d26] px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#beee1d]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
      </div>
      <iframe
        src={embedUrl}
        title="Embed"
        className="min-h-0 flex-1 border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
