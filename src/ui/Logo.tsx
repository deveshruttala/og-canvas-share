import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type LogoProps = {
  /** Show wordmark next to the icon */
  showText?: boolean
  /** Link target — omit for non-clickable logo */
  to?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { icon: 'h-7 w-7', text: 'text-lg' },
  md: { icon: 'h-9 w-9', text: 'text-xl' },
  lg: { icon: 'h-11 w-11', text: 'text-2xl' },
}

/**
 * Brand mark used in nav headers across landing and editor.
 * Uses public/logo.svg for the corkboard + sticky note icon.
 */
export function Logo({ showText = true, to = '/', size = 'md', className }: LogoProps) {
  const s = sizes[size]

  const content = (
    <>
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt=""
        aria-hidden
        className={cn(s.icon, 'shrink-0 rounded-lg shadow-wall')}
      />
      {showText && (
        <span className={cn('font-display tracking-tight text-white', s.text)}>Wall</span>
      )}
    </>
  )

  const classes = cn('inline-flex items-center gap-2.5', className)

  if (to) {
    return (
      <Link to={to} className={cn(classes, 'transition-opacity hover:opacity-90')}>
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}
