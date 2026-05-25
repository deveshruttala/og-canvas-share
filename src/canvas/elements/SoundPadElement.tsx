import { useCallback, useRef, useState } from 'react'
import type { CanvasElement } from '@/types/canvas'
import {
  resolveSoundPadLabel,
  SOUND_PAD_SAMPLES,
  type SoundPadData,
  type SoundPadWave,
} from '@/lib/sound-pad-samples'
import { cn } from '@/lib/cn'
import { Play } from 'lucide-react'

type Props = { element: CanvasElement; readOnly?: boolean }

export function SoundPadElement({ element }: Props) {
  const data = element.content as SoundPadData
  const sample = data.sound ? SOUND_PAD_SAMPLES[data.sound] : undefined

  if (sample) {
    return <SampleSoundPad label={resolveSoundPadLabel(data)} sample={sample} />
  }

  return <SynthSoundPad data={data} bg={element.style.bg} />
}

function SampleSoundPad({
  label,
  sample,
}: {
  label: string
  sample: (typeof SOUND_PAD_SAMPLES)[string]
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const play = useCallback(() => {
    let audio = audioRef.current
    if (!audio) {
      audio = new Audio(sample.src)
      audio.crossOrigin = 'anonymous'
      audioRef.current = audio
    }
    audio.currentTime = 0
    void audio.play().then(() => setPlaying(true))
    audio.onended = () => setPlaying(false)
    audio.onpause = () => setPlaying(false)
  }, [sample.src])

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-[#beee1d]/25 bg-[#0a0a0f] p-4 font-mono text-white">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">{label}</p>
      <p className="text-[9px] text-neutral-500">{sample.subtitle} · Sound effect</p>
      <button
        type="button"
        className={cn(
          'mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/50 transition',
          'hover:border-[#beee1d]/50 hover:bg-[#beee1d]/10 active:scale-[0.98]',
          playing && 'border-[#beee1d]/60 bg-[#beee1d]/15',
        )}
        onClick={(e) => {
          e.stopPropagation()
          play()
        }}
        aria-label={`Play ${label}`}
      >
        <span className="text-4xl" aria-hidden>
          {sample.icon}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#beee1d]">
          <Play className="h-3.5 w-3.5" />
          Tap to play
        </span>
      </button>
    </div>
  )
}

function SynthSoundPad({ data, bg }: { data: SoundPadData; bg?: string }) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (freq?: number, wave?: SoundPadWave) => {
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
      style={{ background: bg ?? '#0a0a0f' }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">
        {data.label ?? 'Synth Pad'}
      </p>
      <p className="mb-3 text-[9px] text-neutral-500">
        {data.wave ?? 'sine'} · {data.frequency ?? 440}Hz
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        {pads.map((p) => (
          <button
            key={p.label}
            type="button"
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
