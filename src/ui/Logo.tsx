import { BrandMark } from '@/ui/BrandMark'
import { cn } from '@/lib/cn'

type LogoProps = {
  showText?: boolean
  to?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
}

export function Logo({ showText = true, to = '/', size = 'md', className }: LogoProps) {
  return (
    <BrandMark
      size={sizeMap[size]}
      showText={showText}
      to={to}
      className={cn(className)}
    />
  )
}
