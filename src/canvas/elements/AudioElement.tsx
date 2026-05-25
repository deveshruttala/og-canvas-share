import { useEffect, useRef, useState } from 'react'
import type { CanvasElement, AudioContent } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { Pause, Play, Music2 } from 'lucide-react'
import { getAudioPlayerTheme } from '@/lib/wall-player-presets'

type Props = {
  element: CanvasElement
  selected?: boolean
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioElement({ element, selected }: Props) {
  const content = element.content as AudioContent
  const theme = getAudioPlayerTheme(element.style.playerThemeId)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bars, setBars] = useState(() => Array.from({ length: 16 }, () => 25 + Math.random() * 55))

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setBars(Array.from({ length: 16 }, () => 18 + Math.random() * 82))
    }, 90)
    return () => clearInterval(id)
  }, [playing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else void audio.play()
  }

  const shellStyle = {
    background: element.style.gradient ?? element.style.bg ?? theme.background,
    color: element.style.color ?? theme.text,
    borderColor: theme.border,
    ['--player-accent' as string]: theme.accent,
    ['--player-muted' as string]: theme.muted,
    ['--player-text' as string]: theme.text,
  }

  const title = content.title ?? 'Audio track'
  const artist = content.artist
  const badge = content.badge ?? 'Audio'
  const isCard = theme.layout === 'card'

  return (
    <div
      className={cn(
        'wall-player-audio flex h-full w-full flex-col overflow-hidden rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
        theme.shellClass,
        selected && 'ring-2 ring-[var(--player-accent)] ring-offset-2 ring-offset-black',
      )}
      style={shellStyle}
      data-player-theme={theme.id}
    >
      <div
        className={cn(
          'flex min-h-0 flex-1',
          isCard ? 'flex-row items-stretch gap-0 p-0' : 'flex-col justify-between gap-3 p-3.5 sm:p-4',
        )}
      >
        {isCard && (
          <div className="wall-player-audio-art relative w-[38%] min-w-[5.5rem] shrink-0 overflow-hidden">
            {content.cover ? (
              <img src={content.cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/30">
                <Music2 className="h-10 w-10 opacity-40" style={{ color: theme.accent }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
          </div>
        )}

        <div className={cn('flex min-w-0 flex-1 flex-col justify-center', isCard && 'px-4 py-3')}>
          <div className={cn('flex items-center gap-3', isCard ? 'gap-3' : 'gap-3.5')}>
            {!isCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle()
                }}
                className={cn(
                  'wall-player-audio-play relative flex shrink-0 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-[1.03] active:scale-95',
                  theme.layout === 'compact' ? 'h-12 w-12' : 'h-14 w-14 sm:h-16 sm:w-16',
                  playing && 'wall-player-audio-play--spin',
                )}
                style={{ borderColor: theme.border, background: 'rgba(0,0,0,0.45)' }}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {content.cover && theme.layout !== 'compact' ? (
                  <img
                    src={content.cover}
                    alt=""
                    className="absolute inset-0 h-full w-full rounded-full object-cover opacity-90"
                  />
                ) : (
                  <span
                    className="absolute inset-1 rounded-full opacity-80"
                    style={{
                      background: `conic-gradient(from 45deg, ${theme.accent}44, transparent, ${theme.accent}22)`,
                    }}
                  />
                )}
                <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-black/50">
                  {playing ? (
                    <Pause className="h-5 w-5" style={{ color: theme.accent }} />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" style={{ color: theme.accent }} />
                  )}
                </span>
              </button>
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider"
                  style={{ background: `${theme.accent}22`, color: theme.accent }}
                >
                  {badge}
                </span>
              </div>
              <p className="truncate text-sm font-bold leading-tight" style={{ color: theme.accent }}>
                {title}
              </p>
              {artist && (
                <p className="truncate text-[11px] leading-snug" style={{ color: theme.muted }}>
                  {artist}
                </p>
              )}
              {theme.layout === 'wave' && (
                <div className="mt-2 flex h-5 items-end gap-px">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className={cn('wall-player-bar w-[3px] rounded-t-sm', playing && 'wall-player-bar--live')}
                      style={{
                        height: `${h}%`,
                        background: playing ? theme.accent : `${theme.muted}55`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {isCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle()
                }}
                className="wall-player-audio-play flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 shadow-md"
                style={{ borderColor: theme.border, background: 'rgba(0,0,0,0.5)' }}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <Pause className="h-4 w-4" style={{ color: theme.accent }} />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" style={{ color: theme.accent }} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={cn('shrink-0 px-3.5 pb-3 sm:px-4 sm:pb-3.5', isCard && 'px-4')}>
        <div className="mb-1 flex justify-between text-[9px] font-semibold tabular-nums" style={{ color: theme.muted }}>
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: `${theme.muted}33` }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${progress * 100}%`, background: theme.accent }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={content.src}
        preload="metadata"
        onLoadedMetadata={() => {
          const a = audioRef.current
          if (a) setDuration(a.duration)
        }}
        onTimeUpdate={() => {
          const a = audioRef.current
          if (a?.duration) {
            setProgress(a.currentTime / a.duration)
            setCurrent(a.currentTime)
            setDuration(a.duration)
          }
        }}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  )
}
