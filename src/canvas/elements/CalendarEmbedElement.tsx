type Props = {
  embedUrl: string
  selected?: boolean
}

/** Cal.com booking embed (no visitor auth). */
export function CalendarEmbedElement({ embedUrl, selected }: Props) {
  return (
    <div
      className={`h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl ${
        selected ? 'ring-2 ring-[#beee1d]/50' : ''
      }`}
    >
      <iframe
        title="Book a meeting"
        src={embedUrl}
        className="h-full w-full border-0"
        loading="lazy"
      />
    </div>
  )
}
