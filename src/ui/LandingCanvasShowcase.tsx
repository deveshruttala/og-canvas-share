export function LandingCanvasShowcase() {
  return (
    <div className="wall-preview">
      <div className="wall-preview-chrome">
        <div className="wall-preview-toolbar">
          <span className="wall-preview-live" aria-hidden />
          <span className="wall-preview-user">@devesh</span>
          <span className="wall-preview-badge">Live</span>
        </div>
        <span className="wall-preview-size">1600 × 1000</span>
      </div>

      <div className="wall-preview-canvas">
        <article className="wall-tile wall-tile-hero">
          <p className="wall-tile-kicker">Profile</p>
          <h3>Hey, I&apos;m Devesh</h3>
          <p>Builder crafting living noticeboards — one canvas, every embed stays in sync.</p>
          <div className="wall-tile-chips">
            <span>React</span>
            <span>Design</span>
            <span>Indie web</span>
          </div>
        </article>

        <article className="wall-tile wall-tile-github">
          <p className="wall-tile-kicker">GitHub</p>
          <p className="wall-tile-title">devesh/wall</p>
          <div className="wall-tile-graph" aria-hidden>
            {Array.from({ length: 56 }).map((_, i) => (
              <span key={i} className={`g${(i * 5 + 11) % 5}`} />
            ))}
          </div>
          <p className="wall-tile-foot">★ 842 · 12 repos</p>
        </article>

        <article className="wall-tile wall-tile-visual" aria-label="Workspace">
          <span className="wall-tile-visual-tag">Shipping</span>
        </article>

        <article className="wall-tile wall-tile-music">
          <div className="wall-tile-disc" aria-hidden />
          <div>
            <p className="wall-tile-kicker">Now playing</p>
            <p className="wall-tile-title">Midnight Canvas</p>
            <div className="wall-tile-bars" aria-hidden>
              {[3, 6, 4, 8, 5, 7, 4, 6].map((h, i) => (
                <span key={i} style={{ height: `${h * 4}px` }} />
              ))}
            </div>
          </div>
        </article>

        <article className="wall-tile wall-tile-link">
          <p className="wall-tile-kicker">Featured</p>
          <h3>Portfolio</h3>
          <p>Experiments, write-ups, and open-source tools.</p>
          <span className="wall-tile-url">github.com/devesh</span>
        </article>

        <article className="wall-tile wall-tile-stat">
          <p className="wall-tile-stat-num">2.4k</p>
          <p className="wall-tile-stat-label">views</p>
        </article>

        <article className="wall-tile wall-tile-qr">
          <div className="wall-tile-qr-code" aria-hidden />
          <p>wall.app/devesh</p>
        </article>
      </div>
    </div>
  )
}
