import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { displayAssetUrl } from '@/lib/asset-proxy'
import { cn } from '@/lib/cn'

type Props = {
  src: string
  alt?: string
  className?: string
}

/** Thumbnail with proxy URL + fallback when CDN blocks hotlinking. */
export function OmniThumb({ src, alt = '', className }: Props) {
  const [failed, setFailed] = useState(false)
  const proxied = displayAssetUrl(src)

  if (failed || !proxied) {
    return (
      <span className={cn('flex h-full w-full items-center justify-center bg-white/5', className)}>
        <ImageIcon className="h-6 w-6 text-white/25" aria-hidden />
      </span>
    )
  }

  return (
    <img
      src={proxied}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('h-full w-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  )
}
