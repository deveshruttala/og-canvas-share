const CARDS = [
  { platform: 'GitHub', handle: 'devesh', color: '#1c1917', accent: '#a78bfa' },
  { platform: 'Link bio', handle: 'devesh', color: '#312e81', accent: '#c4b5fd' },
  { platform: 'README', handle: 'devesh', color: '#831843', accent: '#f9a8d4' },
  { platform: 'Email sig', handle: 'devesh', color: '#134e4a', accent: '#5eead4' },
  { platform: 'Portfolio', handle: 'devesh', color: '#713f12', accent: '#fcd34d' },
]

export function LandingFanCards() {
  return (
    <div className="landing-fan" aria-hidden>
      {CARDS.map((card, i) => (
        <article
          key={card.platform}
          className="landing-fan-card"
          style={
            {
              '--fan-i': i,
              '--fan-color': card.color,
              '--fan-accent': card.accent,
            } as React.CSSProperties
          }
        >
          <span className="landing-fan-platform">{card.platform}</span>
          <span className="landing-fan-handle">wall.app/{card.handle}</span>
          <span className="landing-fan-dot" />
        </article>
      ))}
      <span className="landing-fan-pill">/devesh</span>
    </div>
  )
}
