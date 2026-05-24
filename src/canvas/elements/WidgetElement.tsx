import { useEffect, useState } from 'react'
import type { CanvasElement, WidgetContent } from '@/types/canvas'
import { cn } from '@/lib/cn'

type Props = {
  element: CanvasElement
  selected?: boolean
}

function FlipDigit({ value, label }: { value: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-600">{label}</span>}
      <div className="wall-flip-digit">
        <span key={value} className="wall-flip-digit-inner">
          {value}
        </span>
      </div>
    </div>
  )
}

function useVisBars(count: number, active: boolean) {
  const [bars, setBars] = useState(() => Array.from({ length: count }, () => 30 + Math.random() * 50))

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setBars(Array.from({ length: count }, () => 25 + Math.random() * 75))
    }, 120)
    return () => clearInterval(id)
  }, [active, count])

  return bars
}

export function WidgetElement({ element, selected }: Props) {
  const widget = element.content as WidgetContent
  const [time, setTime] = useState(new Date())
  const [playing, setPlaying] = useState(true)
  const [hoverCell, setHoverCell] = useState<number | null>(null)
  const visBars = useVisBars(12, widget.type === 'spotify' && playing)

  useEffect(() => {
    if (widget.type !== 'clock') return
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [widget.type])

  const shell = cn(
    'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 p-4 font-mono text-white wall-widget-shell',
    selected && 'ring-2 ring-[#beee1d] ring-offset-2 ring-offset-black',
  )

  const bg = (element.style as { gradient?: string }).gradient ?? element.style.bg ?? '#0d0e12'

  if (widget.type === 'clock') {
    const h = time.getHours().toString().padStart(2, '0')
    const m = time.getMinutes().toString().padStart(2, '0')
    const s = time.getSeconds().toString().padStart(2, '0')
    return (
      <div className={shell} style={{ background: bg }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">
          {widget.location ?? widget.label ?? 'Flip Clock'}
        </span>
        <div className="mt-3 flex items-center justify-center gap-2">
          <FlipDigit value={h[0]!} />
          <FlipDigit value={h[1]!} />
          <span className="text-2xl font-black text-[#beee1d] animate-pulse">:</span>
          <FlipDigit value={m[0]!} />
          <FlipDigit value={m[1]!} />
          <span className="text-2xl font-black text-[#beee1d] animate-pulse">:</span>
          <FlipDigit value={s[0]!} />
          <FlipDigit value={s[1]!} />
        </div>
      </div>
    )
  }

  if (widget.type === 'weather') {
    return (
      <div className={shell} style={{ background: bg }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#beee1d]">{widget.location ?? 'Your city'}</p>
            <p className="text-[10px] text-neutral-400">Light winds · feels live</p>
          </div>
          <span className="text-3xl wall-float-slow">🌤️</span>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <span className="text-4xl font-black wall-glow-text">72°</span>
          <span className="rounded-full bg-[#beee1d]/10 px-2.5 py-1 text-[9px] font-black tracking-widest text-[#beee1d] wall-pulse-badge">
            LIVE
          </span>
        </div>
      </div>
    )
  }

  if (widget.type === 'spotify') {
    return (
      <div className={shell} style={{ background: bg }}>
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPlaying((p) => !p)
            }}
            className={cn(
              'relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-neutral-800 bg-black shadow-2xl wall-vinyl-spin',
              !playing && 'paused',
            )}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500" />
            {playing && <span className="absolute inset-0 rounded-full border border-[#beee1d]/20 wall-pulse-ring" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#beee1d]">{widget.label ?? 'Focus beats'}</p>
            <p className="text-[10px] text-neutral-400">Live waveform</p>
            <div className="mt-3 flex h-8 items-end gap-0.5">
              {visBars.map((val, i) => (
                <div
                  key={i}
                  className="wall-vis-bar flex-1 rounded-t-sm bg-gradient-to-t from-[#beee1d]/40 to-[#beee1d]"
                  style={{ height: `${val}%`, animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const cells = Array.from({ length: 49 }, (_, i) => {
    const intensity = (i * 7 + (widget.repo?.length ?? 3)) % 4
    return intensity
  })

  return (
    <div className={shell} style={{ background: bg }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold text-[#beee1d]">{widget.repo ?? 'user/repo'}</p>
          <p className="text-[10px] text-neutral-400">Contribution map · hover cells</p>
        </div>
        <span className="text-lg">🐙</span>
      </div>
      <div className="my-3 grid grid-cols-7 gap-1">
        {cells.map((level, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'h-3 rounded-sm transition-all duration-150',
              level === 0 && 'bg-neutral-800',
              level === 1 && 'bg-emerald-900',
              level === 2 && 'bg-emerald-700',
              level === 3 && 'bg-[#beee1d]',
              hoverCell === i && 'scale-125 ring-1 ring-white',
            )}
            onMouseEnter={() => setHoverCell(i)}
            onMouseLeave={() => setHoverCell(null)}
            onClick={(e) => e.stopPropagation()}
          />
        ))}
      </div>
      <div className="mt-auto flex justify-between text-[9px] font-bold text-neutral-500">
        <span>Stars: {1420 + (hoverCell ?? 0)}</span>
        <span>Forks: {89 + Math.floor((hoverCell ?? 0) / 7)}</span>
      </div>
    </div>
  )
}
