import { useState } from 'react'
import {
  LANDING_SAMPLES,
  type LandingSampleId,
  type LandingTile,
} from '@/ui/landing-samples'
import { cn } from '@/lib/cn'

function TileGraph({ cells = 56 }: { cells?: number }) {
  return (
    <div className="wall-tile-graph" aria-hidden>
      {Array.from({ length: cells }).map((_, i) => (
        <span key={i} className={`g${(i * 5 + 11) % 5}`} />
      ))}
    </div>
  )
}

function LandingTileView({ tile }: { tile: LandingTile }) {
  const base = cn('wall-tile', tile.className, `wall-tile--${tile.kind}`)

  switch (tile.kind) {
    case 'hero':
      return (
        <article className={cn(base, 'wall-tile-hero')} style={tile.style}>
          {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
          {tile.title && <h3>{tile.title}</h3>}
          {tile.body && <p>{tile.body}</p>}
          {tile.chips && (
            <div className="wall-tile-chips">
              {tile.chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          )}
        </article>
      )
    case 'github':
      return (
        <article className={cn(base, 'wall-tile-github')} style={tile.style}>
          {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
          {tile.title && <p className="wall-tile-title">{tile.title}</p>}
          <TileGraph cells={tile.graphCells} />
          {tile.foot && <p className="wall-tile-foot">{tile.foot}</p>}
        </article>
      )
    case 'visual':
      return (
        <article
          className={cn(base, 'wall-tile-visual')}
          style={{
            ...tile.style,
            backgroundImage: tile.image
              ? `linear-gradient(180deg, transparent 45%, rgba(8,8,12,0.88)), url(${tile.image})`
              : undefined,
          }}
          aria-label={tile.tag ?? 'Visual'}
        >
          {tile.tag && <span className="wall-tile-visual-tag">{tile.tag}</span>}
        </article>
      )
    case 'music':
      return (
        <article className={cn(base, 'wall-tile-music')} style={tile.style}>
          <div className="wall-tile-disc" aria-hidden />
          <div>
            {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
            {tile.title && <p className="wall-tile-title">{tile.title}</p>}
            {tile.bars && (
              <div className="wall-tile-bars" aria-hidden>
                {tile.bars.map((h, i) => (
                  <span key={i} style={{ height: `${h * 4}px` }} />
                ))}
              </div>
            )}
          </div>
        </article>
      )
    case 'link':
      return (
        <article className={cn(base, 'wall-tile-link')} style={tile.style}>
          {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
          {tile.title && <h3>{tile.title}</h3>}
          {tile.body && <p>{tile.body}</p>}
          {tile.url && <span className="wall-tile-url">{tile.url}</span>}
        </article>
      )
    case 'stat':
      return (
        <article className={cn(base, 'wall-tile-stat')} style={tile.style}>
          {tile.stat && <p className="wall-tile-stat-num">{tile.stat}</p>}
          {tile.statLabel && <p className="wall-tile-stat-label">{tile.statLabel}</p>}
        </article>
      )
    case 'qr':
      return (
        <article className={cn(base, 'wall-tile-qr')} style={tile.style}>
          <div className="wall-tile-qr-code" aria-hidden />
          {tile.url && <p>{tile.url}</p>}
        </article>
      )
    case 'sticky':
      return (
        <article
          className={cn(base, 'wall-tile-sticky', tile.accent && `wall-tile-sticky--${tile.accent}`)}
          style={tile.style}
        >
          {tile.title && <p className="wall-tile-sticky-title">{tile.title}</p>}
          {tile.body && <p className="wall-tile-sticky-body">{tile.body}</p>}
        </article>
      )
    case 'cta':
      return (
        <article className={cn(base, 'wall-tile-cta')} style={tile.style}>
          {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
          {tile.title && <h3>{tile.title}</h3>}
          {tile.body && <p>{tile.body}</p>}
          {tile.chips && (
            <div className="wall-tile-chips">
              {tile.chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          )}
        </article>
      )
    case 'feature':
      return (
        <article className={cn(base, 'wall-tile-feature')} style={tile.style}>
          {tile.title && <h4>{tile.title}</h4>}
          {tile.body && <p>{tile.body}</p>}
        </article>
      )
    case 'widget':
      return (
        <article className={cn(base, 'wall-tile-widget')} style={tile.style}>
          {tile.kicker && <p className="wall-tile-kicker">{tile.kicker}</p>}
          {tile.title && <p className="wall-tile-title">{tile.title}</p>}
          {tile.body && <p className="wall-tile-widget-body">{tile.body}</p>}
          {tile.tag && <span className="wall-tile-widget-badge">{tile.tag}</span>}
          <div className="wall-tile-widget-grid" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </article>
      )
    case 'schedule':
      return (
        <article className={cn(base, 'wall-tile-schedule')} style={tile.style}>
          {tile.title && <p className="wall-tile-schedule-title">{tile.title}</p>}
          {tile.body && <pre className="wall-tile-schedule-body">{tile.body}</pre>}
        </article>
      )
    case 'menu':
      return (
        <article className={cn(base, 'wall-tile-menu')} style={tile.style}>
          {tile.title && <p className="wall-tile-menu-title">{tile.title}</p>}
          {tile.body && <p className="wall-tile-menu-body">{tile.body}</p>}
        </article>
      )
    case 'polaroid':
      return (
        <article className={cn(base, 'wall-tile-polaroid')} style={tile.style}>
          <div
            className="wall-tile-polaroid-frame"
            style={
              tile.image
                ? {
                    backgroundImage: `url(${tile.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
            aria-hidden
          />
          {tile.title && <p className="wall-tile-polaroid-title">{tile.title}</p>}
          {tile.body && <p>{tile.body}</p>}
        </article>
      )
    default:
      return null
  }
}

export function LandingCanvasShowcase() {
  const [activeId, setActiveId] = useState<LandingSampleId>('devesh')
  const sample = LANDING_SAMPLES.find((s) => s.id === activeId) ?? LANDING_SAMPLES[0]

  return (
    <div className="wall-preview-wrap">
      <div className="landing-sample-tabs" role="tablist" aria-label="Sample walls">
        {LANDING_SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeId}
            className={cn('landing-sample-tab', s.id === activeId && 'landing-sample-tab--active')}
            onClick={() => setActiveId(s.id)}
          >
            <span className="landing-sample-tab-label">{s.label}</span>
            <span className="landing-sample-tab-handle">@{s.handle}</span>
          </button>
        ))}
      </div>

      <div className="wall-preview">
        <div className="wall-preview-chrome">
          <div className="wall-preview-toolbar">
            <span className="wall-preview-live" aria-hidden />
            <span className="wall-preview-user">@{sample.handle}</span>
            <span className="wall-preview-badge">Live</span>
          </div>
          <span className="wall-preview-size">1600 × 1000</span>
        </div>

        <div
          key={sample.id}
          className={cn('wall-preview-canvas wall-preview-canvas--scatter', sample.canvasClass)}
        >
          {sample.tiles.map((tile) => (
            <LandingTileView key={tile.id} tile={tile} />
          ))}
        </div>
      </div>

      <p className="landing-sample-blurb">
        <strong>{sample.label}</strong> — {sample.description}
      </p>
    </div>
  )
}
