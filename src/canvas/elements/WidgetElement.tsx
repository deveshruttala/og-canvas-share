import { useEffect, useState } from 'react'
import type { CanvasElement, WidgetContent } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { fetchRssFeed, type RssItem } from '@/lib/feed-rss'
import {
  fetchWeatherBundle,
  geocodePlace,
  weatherIcon,
  type OpenMeteoDay,
} from '@/lib/open-meteo'
import {
  fetchGitHubUserStats,
  githubContributionChartUrl,
  type GitHubUserStats,
} from '@/lib/github-stats'
import { fetchSpotifyNowPlaying, type SpotifyNowPlaying } from '@/lib/spotify-auth'
import {
  fetchStravaRecentActivities,
  formatStravaDistance,
  formatStravaDuration,
  type StravaActivity,
} from '@/lib/strava-api'

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

export function WidgetElement({ element }: Props) {
  const widget = element.content as WidgetContent
  const [time, setTime] = useState(new Date())
  const [playing, setPlaying] = useState(true)
  const [hoverCell, setHoverCell] = useState<number | null>(null)
  const [rssItems, setRssItems] = useState<RssItem[]>([])
  const [rssError, setRssError] = useState<string | null>(null)
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null)
  const [weatherCode, setWeatherCode] = useState<number | null>(null)
  const [weatherUnit, setWeatherUnit] = useState('°C')
  const [weatherLabel, setWeatherLabel] = useState<string | null>(null)
  const [weatherDetail, setWeatherDetail] = useState<string | null>(null)
  const [weatherWind, setWeatherWind] = useState<string | null>(null)
  const [weatherForecast, setWeatherForecast] = useState<OpenMeteoDay[]>([])
  const [ghStats, setGhStats] = useState<GitHubUserStats | null>(null)
  const [ghError, setGhError] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null)
  const [spotifyNote, setSpotifyNote] = useState<string | null>(null)
  const [stravaActs, setStravaActs] = useState<StravaActivity[]>([])
  const [stravaError, setStravaError] = useState<string | null>(null)
  const visBars = useVisBars(12, (widget.type === 'spotify' || widget.type === 'spotify_now') && playing)

  useEffect(() => {
    if (widget.type !== 'rss' || !widget.feedUrl) return
    let cancelled = false
    void fetchRssFeed(widget.feedUrl, widget.feedLimit ?? 5)
      .then((items) => {
        if (!cancelled) {
          setRssItems(items)
          setRssError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setRssError(e instanceof Error ? e.message : 'Feed unavailable')
          setRssItems([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [widget.type, widget.feedUrl, widget.feedLimit])

  useEffect(() => {
    if (widget.type !== 'weather') return
    const place = widget.location?.trim()
    if (!place) return
    let cancelled = false
    void (async () => {
      const geo = await geocodePlace(place)
      if (!geo || cancelled) return
      setWeatherLabel(geo.label)
      const bundle = await fetchWeatherBundle(geo.lat, geo.lon)
      if (!bundle || cancelled) return
      setWeatherTemp(bundle.current.temperature)
      setWeatherCode(bundle.current.weatherCode)
      setWeatherUnit(bundle.current.unit)
      setWeatherDetail(bundle.current.label)
      setWeatherWind(
        bundle.current.windSpeed != null
          ? `Wind ${bundle.current.windSpeed} ${bundle.current.windUnit ?? 'km/h'}`
          : null,
      )
      setWeatherForecast(bundle.forecast)
    })()
    return () => {
      cancelled = true
    }
  }, [widget.type, widget.location])

  useEffect(() => {
    if (widget.type !== 'github_stats') return
    const user = widget.username?.trim()
    if (!user) return
    let cancelled = false
    void fetchGitHubUserStats(user)
      .then((s) => {
        if (!cancelled) {
          setGhStats(s)
          setGhError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setGhError(e instanceof Error ? e.message : 'GitHub unavailable')
          setGhStats(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [widget.type, widget.username])

  useEffect(() => {
    if (widget.type !== 'spotify_now') return
    const load = () => {
      void fetchSpotifyNowPlaying().then((np) => {
        setNowPlaying(np)
        setSpotifyNote(np ? null : 'Connect Spotify in Connections')
      })
    }
    load()
    const id = setInterval(load, 20_000)
    return () => clearInterval(id)
  }, [widget.type])

  useEffect(() => {
    if (widget.type !== 'strava') return
    let cancelled = false
    void fetchStravaRecentActivities(4)
      .then((acts) => {
        if (!cancelled) {
          setStravaActs(acts)
          setStravaError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setStravaError(e instanceof Error ? e.message : 'Strava unavailable')
          setStravaActs([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [widget.type])

  useEffect(() => {
    if (widget.type !== 'clock') return
    const tick = () => setTime(new Date())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [widget.type, widget.timezone])

  const shell =
    'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 p-4 font-mono text-white wall-widget-shell'

  const bg = (element.style as { gradient?: string }).gradient ?? element.style.bg ?? '#0d0e12'

  if (widget.type === 'clock') {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: widget.timezone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(time)
    const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
    const h = pick('hour').padStart(2, '0')
    const m = pick('minute').padStart(2, '0')
    const s = pick('second').padStart(2, '0')
    return (
      <div className={shell} style={{ background: bg }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">
          {(widget.location ?? widget.label ?? 'Flip Clock').toUpperCase()}
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
    const icon = weatherCode != null ? weatherIcon(weatherCode) : '🌤️'
    const temp = weatherTemp != null ? `${weatherTemp}${weatherUnit}` : '—'
    return (
      <div className={shell} style={{ background: bg }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#beee1d]">
              {weatherLabel ?? widget.location ?? 'Your city'}
            </p>
            <p className="text-[10px] text-neutral-400">
              {weatherDetail ?? 'Open-Meteo'} {weatherWind ? `· ${weatherWind}` : ''}
            </p>
          </div>
          <span className="text-3xl wall-float-slow shrink-0">{icon}</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-4xl font-black wall-glow-text">{temp}</span>
          <span className="rounded-full bg-[#beee1d]/10 px-2.5 py-1 text-[9px] font-black tracking-widest text-[#beee1d]">
            LIVE
          </span>
        </div>
        {weatherForecast.length > 0 && (
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-2">
            {weatherForecast.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center text-center">
                <span className="text-sm">{weatherIcon(day.code)}</span>
                <span className="text-[9px] font-bold text-neutral-400">
                  {day.max}° / {day.min}°
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (widget.type === 'github_stats') {
    const user = widget.username ?? 'octocat'
    return (
      <div className={shell} style={{ background: bg }}>
        {ghError ? (
          <p className="text-[10px] text-amber-300/90">{ghError}</p>
        ) : ghStats ? (
          <>
            <div className="flex items-center gap-3">
              <img
                src={ghStats.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full border border-white/10"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#beee1d]">
                  {ghStats.name ?? ghStats.login}
                </p>
                <p className="text-[10px] text-neutral-400">@{ghStats.login}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-[10px] font-bold text-neutral-300">
              <span>{ghStats.publicRepos} repos</span>
              <span>{ghStats.followers} followers</span>
            </div>
            <img
              src={githubContributionChartUrl(ghStats.login)}
              alt="Contributions"
              className="mt-2 h-16 w-full rounded-lg object-cover opacity-90"
            />
          </>
        ) : (
          <p className="text-[10px] text-neutral-500">Loading GitHub…</p>
        )}
        {!ghStats && !ghError && (
          <p className="mt-1 text-[9px] text-neutral-600">User: {user}</p>
        )}
      </div>
    )
  }

  if (widget.type === 'spotify_now') {
    return (
      <div className={shell} style={{ background: bg }}>
        {nowPlaying ? (
          <div className="flex flex-1 items-center gap-3">
            {nowPlaying.albumArt ? (
              <img
                src={nowPlaying.albumArt}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#1db954]/20 text-2xl">
                🎵
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#beee1d]">{nowPlaying.title}</p>
              <p className="truncate text-[10px] text-neutral-400">{nowPlaying.artist}</p>
              <p className="mt-1 text-[9px] text-[#1db954]">
                {nowPlaying.isPlaying ? '▶ Now playing' : '⏸ Paused'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-neutral-400">
            {spotifyNote ?? 'Link Spotify in Connections (OAuth)'}
          </p>
        )}
      </div>
    )
  }

  if (widget.type === 'strava') {
    return (
      <div className={shell} style={{ background: bg }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#fc4c02]">
          STRAVA
        </p>
        {stravaError ? (
          <p className="mt-2 text-[10px] text-amber-300/90">{stravaError}</p>
        ) : (
          <ul className="mt-2 flex-1 space-y-2">
            {stravaActs.map((a) => (
              <li key={a.id} className="min-w-0 border-b border-white/5 pb-1">
                <p className="truncate text-xs font-semibold">{a.name}</p>
                <p className="text-[9px] text-neutral-500">
                  {a.type} · {formatStravaDistance(a.distance)} · {formatStravaDuration(a.movingTime)}
                </p>
              </li>
            ))}
            {stravaActs.length === 0 && (
              <li className="text-[10px] text-neutral-500">Loading activities…</li>
            )}
          </ul>
        )}
      </div>
    )
  }

  if (widget.type === 'rss') {
    return (
      <div className={shell} style={{ background: bg }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#beee1d]">
          {(widget.label ?? 'Live feed').toUpperCase()}
        </p>
        {rssError ? (
          <p className="mt-2 text-[10px] text-amber-300/90">{rssError}</p>
        ) : (
          <ul className="mt-2 flex-1 space-y-2 overflow-hidden">
            {rssItems.map((item, i) => (
              <li key={`${item.link ?? item.title}-${i}`} className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                {item.summary && (
                  <p className="truncate text-[9px] text-neutral-500">{item.summary}</p>
                )}
              </li>
            ))}
            {rssItems.length === 0 && !rssError && (
              <li className="text-[10px] text-neutral-500">Loading feed…</li>
            )}
          </ul>
        )}
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

  if (widget.type !== 'github') {
    return (
      <div className={shell} style={{ background: bg }}>
        <p className="text-[10px] text-neutral-500">Unknown widget</p>
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
