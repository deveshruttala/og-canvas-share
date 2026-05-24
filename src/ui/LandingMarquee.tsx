const MARQUEE_A = [
  { handle: 'devesh', hue: 'violet', label: 'Builder' },
  { handle: 'folio', hue: 'lime', label: 'Designer' },
  { handle: 'studio', hue: 'coral', label: 'Creator' },
  { handle: 'readme', hue: 'sky', label: 'Dev' },
  { handle: 'indie', hue: 'pink', label: 'Founder' },
  { handle: 'canvas', hue: 'amber', label: 'Artist' },
]

const MARQUEE_B = [
  { handle: 'wall-live', hue: 'mint', label: 'Streamer' },
  { handle: 'notes', hue: 'grape', label: 'Writer' },
  { handle: 'embed', hue: 'sunset', label: 'Engineer' },
  { handle: 'devesh', hue: 'violet', label: 'You' },
  { handle: 'widgets', hue: 'ocean', label: 'Maker' },
  { handle: 'openweb', hue: 'lime', label: 'Indie' },
]

function MarqueeRow({ items, reverse }: { items: typeof MARQUEE_A; reverse?: boolean }) {
  const track = [...items, ...items]

  return (
    <div className="landing-marquee" aria-hidden>
      <div className={`landing-marquee-track${reverse ? ' landing-marquee-track-reverse' : ''}`}>
        {track.map((item, i) => (
          <div key={`${item.handle}-${i}`} className={`landing-marquee-card landing-marquee-${item.hue}`}>
            <span className="landing-marquee-avatar">{item.handle[0]?.toUpperCase()}</span>
            <div className="landing-marquee-meta">
              <strong>/{item.handle}</strong>
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LandingMarquee() {
  return (
    <section className="landing-marquee-section" aria-label="Wall profiles scrolling">
      <MarqueeRow items={MARQUEE_A} />
      <MarqueeRow items={MARQUEE_B} reverse />
    </section>
  )
}
