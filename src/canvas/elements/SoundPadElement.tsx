import { useCallback, useRef } from 'react'
import type { CanvasElement } from '@/types/canvas'
import { cn } from '@/lib/cn'

type Props = { element: CanvasElement; readOnly?: boolean }

type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle'

export function SoundPadElement({ element }: Props) {
  const data = element.content as {
    label?: string
    frequency?: number
    wave?: WaveType
  }
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (freq?: number, wave?: WaveType) => {
      const frequency = freq ?? data.frequency ?? 440
      const type = wave ?? data.wave ?? 'sine'
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    },
    [data.frequency, data.wave],
  )

  const pads = [
    { label: 'C4', freq: 261.63 },
    { label: 'E4', freq: 329.63 },
    { label: 'G4', freq: 392.0 },
    { label: 'A4', freq: 440.0 },
  ]

  return (
    <div
      className="flex h-full w-full flex-col rounded-2xl border border-[#beee1d]/20 p-4 font-mono text-white"
      style={{ background: element.style.bg ?? '#0a0a0f' }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">
        {data.label ?? 'Synth Pad'}
      </p>
      <p className="mb-3 text-[9px] text-neutral-500">{data.wave ?? 'sine'} · {data.frequency ?? 440}Hz</p>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {pads.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={false}
            className={cn(
              'wall-sound-pad-btn rounded-xl border border-white/10 bg-black/40 text-sm font-black transition',
              'hover:border-[#beee1d]/50 hover:bg-[#beee1d]/10 active:scale-95',
            )}
            onClick={(e) => {
              e.stopPropagation()
              play(p.freq)
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
