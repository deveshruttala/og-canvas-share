import type { CSSProperties } from 'react'
import type { ElementStyle, ShadowSize } from '@/types/canvas'

const shadowMap: Record<ShadowSize, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '2px 4px 12px rgba(0,0,0,0.15)',
  lg: '0 8px 24px rgba(0,0,0,0.2)',
}

export function elementStyleToCss(style: ElementStyle): CSSProperties {
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    borderRadius: style.borderRadius,
    boxShadow: style.shadow ? shadowMap[style.shadow] : undefined,
    border: style.border,
  }
}
