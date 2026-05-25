import { useMemo, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { thumbUrlCandidates } from '@/lib/asset-proxy'
import { cn } from '@/lib/cn'

type Props = {
  src: string
  fallback?: string
  alt?: string
  className?: string
}

/** Thumbnail with CDN-direct URLs when possible + fallbacks when a host blocks or rate-limits. */
export function OmniThumb({ src, fallback, alt = '', className }: Props) {
  const candidates = useMemo(() => thumbUrlCandidates(src, fallback), [src, fallback])
  const [index, setIndex] = useState(0)

  const current = candidates[index]

  if (!current || index >= candidates.length) {
    return (
      <span className={cn('flex h-full w-full items-center justify-center bg-white/5', className)}>
        <ImageIcon className="h-6 w-6 text-white/25" aria-hidden />
      </span>
    )
  }

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn('h-full w-full object-cover', className)}
      onError={() => setIndex((i) => i + 1)}
    />
  )
}
