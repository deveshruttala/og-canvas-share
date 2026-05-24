import { useEffect, useRef, useState } from 'react'
import type { CanvasElement, AudioContent } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { Pause, Play } from 'lucide-react'

type Props = {
  element: CanvasElement
  selected?: boolean
}

export function AudioElement({ element, selected }: Props) {
  const content = element.content as AudioContent
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [bars, setBars] = useState(() => Array.from({ length: 12 }, () => 30 + Math.random() * 50))

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setBars(Array.from({ length: 12 }, () => 20 + Math.random() * 80))
    }, 100)
    return () => clearInterval(id)
  }, [playing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else void audio.play()
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 font-mono text-white',
        selected && 'ring-2 ring-[#beee1d] ring-offset-2 ring-offset-black',
      )}
      style={{ background: element.style.bg ?? '#0d0e12' }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          className={cn(
            'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-neutral-800 bg-black shadow-xl wall-vinyl-spin',
            !playing && 'paused',
          )}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </span>
          <span className="h-5 w-5 rounded-full bg-indigo-500" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[#beee1d]">{content.title ?? 'Audio track'}</p>
          {content.artist && <p className="truncate text-[10px] text-neutral-400">{content.artist}</p>}
          <div className="mt-2 flex h-4 items-end gap-0.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className={cn('wall-vis-bar w-1 rounded-t-sm', playing ? 'bg-[#beee1d]' : 'bg-neutral-700')}
                style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#beee1d] transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <audio
        ref={audioRef}
        src={content.src}
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current
          if (a?.duration) setProgress(a.currentTime / a.duration)
        }}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  )
}
