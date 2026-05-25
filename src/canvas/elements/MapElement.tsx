type Props = {
  lat: number
  lng: number
  zoom?: number
  label?: string
  selected?: boolean
}

/** OpenStreetMap embed — no API key. */
export function MapElement({ lat, lng, zoom = 13, label, selected }: Props) {
  const delta = 0.02 / (zoom / 13)
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join('%2C')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e12] shadow-xl ${
        selected ? 'ring-2 ring-[#beee1d]/50' : ''
      }`}
    >
      {label && (
        <p className="border-b border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#beee1d]">
          {label}
        </p>
      )}
      <iframe title={label ?? 'Map'} src={src} className="min-h-0 flex-1 w-full border-0" loading="lazy" />
    </div>
  )
}
