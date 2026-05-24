/**
 * Static showcase of a living wall — no tldraw on the landing page (lighter + no inspector bleed).
 */
export function LandingCanvasShowcase() {
  return (
    <div className="landing-canvas-frame" id="canvas">
      <div className="landing-canvas-header">
        <div>
          <p className="landing-canvas-kicker">My living canvas</p>
          <h2 className="landing-canvas-title">Private noticeboard draft</h2>
        </div>
        <span className="landing-canvas-badge">Preview</span>
      </div>

      <div className="landing-canvas-board">
        <article className="landing-widget landing-widget-bio">
          <h3>
            Hi! Hello, I&apos;m Jaswanth <span aria-hidden>👋</span>
          </h3>
          <p>
            Full-Stack Engineer building experimental interactive canvases. Welcome to my living wall!
          </p>
          <ul>
            <li>✨ React / WebGL / Node.js</li>
            <li>🎨 Passionate about high-contrast design</li>
            <li>📦 Creative layouts &amp; UI architecture</li>
          </ul>
          <span className="landing-widget-hint">Double-click to edit</span>
        </article>

        <article className="landing-widget landing-widget-github">
          <p className="landing-widget-label">jaswanth/wall</p>
          <p className="landing-widget-sub">Commit contribution app</p>
          <div className="landing-github-grid" aria-hidden>
            {Array.from({ length: 56 }).map((_, i) => (
              <span key={i} className={`landing-github-cell level-${(i % 4) + 1}`} />
            ))}
          </div>
          <div className="landing-widget-stats">
            <span>Stars: 1,429</span>
            <span>Forks: 22</span>
          </div>
        </article>

        <article className="landing-widget landing-widget-image" aria-label="Circuit board artwork" />

        <article className="landing-widget landing-widget-emoji" aria-hidden>
          🚀
        </article>

        <article className="landing-widget landing-widget-audio">
          <div className="landing-vinyl" aria-hidden />
          <div>
            <p className="landing-widget-label">Hyper-focus Ambient waves</p>
            <p className="landing-widget-sub">Visual Soundscape Track</p>
            <div className="landing-audio-bars" aria-hidden>
              {[3, 5, 2, 6, 4, 7, 3].map((h, i) => (
                <span key={i} style={{ height: `${h * 4}px` }} />
              ))}
            </div>
          </div>
        </article>

        <article className="landing-widget landing-widget-link">
          <p className="landing-widget-label">Link preview</p>
          <h3>GitHub Profile</h3>
          <p>Explore premium repos, custom visual layouts, and lightweight high-impact web-apps.</p>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            https://github.com/jsndv7
          </a>
        </article>

        <article className="landing-widget landing-widget-qr">
          <div className="landing-qr-pattern" aria-hidden />
          <p>wall.app/jaswanth</p>
        </article>
      </div>
    </div>
  )
}
