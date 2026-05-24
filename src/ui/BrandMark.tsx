import { Link } from 'react-router-dom'
import { useId } from 'react'
import { cn } from '@/lib/cn'

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  showText?: boolean
  to?: string
  className?: string
}

const sizeMap = {
  sm: { box: 32, text: 'text-lg' },
  md: { box: 40, text: 'text-xl' },
  lg: { box: 52, text: 'text-2xl' },
  hero: { box: 72, text: 'text-4xl sm:text-5xl' },
}

export function BrandMark({ size = 'md', showText = true, to, className }: BrandMarkProps) {
  const s = sizeMap[size]
  const gradId = useId()
  const shadowId = useId()

  const icon = (
    <svg
      width={s.box}
      height={s.box}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="brand-mark-icon shrink-0"
    >
      <rect x="4" y="4" width="64" height="64" rx="16" fill="#111118" />
      <rect x="4" y="4" width="64" height="64" rx="16" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.85" />

      <path d="M20 20H52M20 36H52M20 52H52M36 20V52" stroke="#2a2a35" strokeWidth="1.5" strokeLinecap="round" />

      <g filter={`url(#${shadowId})`}>
        <rect x="38" y="14" width="22" height="18" rx="3" fill="#fde68a" transform="rotate(8 49 23)" />
        <rect x="38" y="14" width="22" height="18" rx="3" stroke="#fbbf24" strokeWidth="0.75" transform="rotate(8 49 23)" opacity="0.5" />
      </g>
      <circle cx="44" cy="17" r="2.5" fill="#f87171" />

      <rect x="14" y="40" width="16" height="14" rx="2.5" fill="#c4b5fd" opacity="0.35" transform="rotate(-6 22 47)" />

      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="68" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="0.55" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <filter id={shadowId} x="30" y="8" width="40" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
    </svg>
  )

  const content = (
    <>
      {icon}
      {showText && <span className={cn('brand-mark-text font-bold tracking-tight', s.text)}>wall</span>}
    </>
  )

  const classes = cn('brand-mark inline-flex items-center gap-2.5', className)

  if (to) {
    return (
      <Link to={to} className={cn(classes, 'transition-opacity hover:opacity-90')}>
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}
