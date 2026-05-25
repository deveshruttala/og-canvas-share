/** Build Iconify CDN SVG URL from id like `mdi:heart`. */
export function iconifySvgUrl(iconId: string, color = 'beee1d'): string {
  const [prefix, name] = iconId.split(':')
  if (!prefix || !name) return ''
  return `https://api.iconify.design/${prefix}/${name}.svg?color=%23${color.replace('#', '')}`
}
