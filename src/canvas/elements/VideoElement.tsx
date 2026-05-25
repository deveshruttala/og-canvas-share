import { useRef, useState } from 'react'
import type { CanvasElement, VideoContent } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { getVideoPlayerTheme } from '@/lib/wall-player-presets'

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

export function VideoElement({ element, selected }: Props) {
  const data = element.content as VideoContent
  const theme = getVideoPlayerTheme(element.style.playerThemeId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showChrome, setShowChrome] = useState(true)

  const src = data.src ?? ''
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-black/80 text-xs text-white/50">
        No video source
      </div>
    )
  }

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.pause()
    else void v.play()
  }

  const shellStyle = {
    borderColor: theme.border,
    ['--player-accent' as string]: theme.accent,
    ['--player-muted' as string]: theme.muted,
    ['--player-text' as string]: theme.text,
  }

  const isLight = theme.id === 'minimal-light'

  return (
    <div
      className={cn(
        'wall-player-video group relative h-full w-full overflow-hidden rounded-2xl border shadow-[0_24px_56px_rgba(0,0,0,0.5)]',
        theme.shellClass,
        selected && 'ring-2 ring-[var(--player-accent)] ring-offset-2 ring-offset-black',
      )}
      style={shellStyle}
      data-player-theme={theme.id}
      onMouseEnter={() => setShowChrome(true)}
      onMouseLeave={() => playing && setShowChrome(false)}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={data.poster}
        playsInline
        loop
        muted={muted}
        preload="metadata"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        onLoadedMetadata={() => {
          const v = videoRef.current
          if (v) setDuration(v.duration)
        }}
        onTimeUpdate={() => {
          const v = videoRef.current
          if (v?.duration) {
            setProgress(v.currentTime / v.duration)
            setCurrent(v.currentTime)
            setDuration(v.duration)
          }
        }}
        onPlay={() => {
          setPlaying(true)
          setShowChrome(true)
        }}
        onPause={() => setPlaying(false)}
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-200',
          theme.layout === 'cinema' && 'bg-gradient-to-t from-black/85 via-black/20 to-black/30',
          isLight && 'bg-gradient-to-t from-white/70 via-transparent to-transparent',
          !showChrome && playing && 'opacity-0',
        )}
      />

      {data.title && (
        <div
          className={cn(
            'pointer-events-none absolute left-0 right-0 top-0 px-3 py-2.5 transition-opacity',
            !showChrome && playing && 'opacity-0',
          )}
        >
          <p
            className="truncate text-xs font-bold drop-shadow-md"
            style={{ color: isLight ? theme.text : theme.text }}
          >
            {data.title}
          </p>
        </div>
      )}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-1.5 px-3 pb-2.5 pt-8 transition-opacity duration-200',
          !showChrome && playing && 'opacity-0 group-hover:opacity-100',
        )}
      >
        <div
          className="h-1 overflow-hidden rounded-full"
          style={{ background: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)' }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${progress * 100}%`, background: theme.accent }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="wall-player-video-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.55)',
              color: theme.accent,
            }}
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>

          <span
            className="text-[10px] font-semibold tabular-nums"
            style={{ color: isLight ? theme.muted : theme.muted }}
          >
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <span className="flex-1" />

          <button
            type="button"
            className="wall-player-video-btn flex h-7 w-7 items-center justify-center rounded-full opacity-90"
            style={{
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.45)',
              color: theme.text,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setMuted((m) => !m)
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            className="wall-player-video-btn flex h-7 w-7 items-center justify-center rounded-full opacity-90"
            style={{
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.45)',
              color: theme.text,
            }}
            onClick={(e) => {
              e.stopPropagation()
              const v = videoRef.current
              if (v?.requestFullscreen) void v.requestFullscreen()
            }}
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!playing && (
        <button
          type="button"
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-2xl transition-transform hover:scale-105"
          style={{
            borderColor: theme.border,
            background: 'rgba(0,0,0,0.55)',
            color: theme.accent,
          }}
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          aria-label="Play video"
        >
          <Play className="ml-1 h-7 w-7" />
        </button>
      )}
    </div>
  )
}
