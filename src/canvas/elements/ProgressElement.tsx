import type { CanvasElement } from '@/types/canvas'

type Props = { element: CanvasElement }

export function ProgressElement({ element }: Props) {
  const data = element.content as {
    title?: string
    current?: number
    max?: number
    color?: string
  }
  const current = Math.max(0, Number(data.current ?? 42))
  const max = Math.max(1, Number(data.max ?? 100))
  const pct = Math.min(100, Math.round((current / max) * 100))
  const accent = data.color ?? '#beee1d'
  const metaStyle = (element.style as { gradient?: string }).gradient

  return (
    <div
      className="flex h-full w-full flex-col justify-center rounded-2xl border border-white/10 p-5 font-mono text-white"
      style={{ background: metaStyle ?? element.style.bg ?? '#0d0e12' }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-black uppercase tracking-widest text-[#beee1d]">
          {data.title ?? 'Goal Tracker'}
        </p>
        <span className="text-lg font-black tabular-nums" style={{ color: accent }}>
          {pct}%
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/50">
        <div
          className="wall-progress-glow h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent}88, ${accent})`,
            boxShadow: `0 0 20px ${accent}66`,
          }}
        />
      </div>
      <p className="mt-2 text-[10px] text-neutral-500">
        {current} / {max}
      </p>
    </div>
  )
}
