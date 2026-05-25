import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowRight, ChevronDown, Sparkles, Target } from 'lucide-react'
import { BrandMark } from '@/ui/BrandMark'
import { LandingCanvasShowcase } from '@/ui/LandingCanvasShowcase'
import { LandingFanCards } from '@/ui/LandingFanCards'
import { LandingMarquee } from '@/ui/LandingMarquee'
import { useAuthStore } from '@/store/auth.store'
import '@/styles/landing.css'

const TRUST_WORDS = ['creators', 'developers', 'designers', 'founders', 'streamers', 'musicians']

export function Landing() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  return (
    <div className="landing-page">
      <main>
        <section className="landing-hero-full">
          <div className="landing-hero-glow" aria-hidden />
          <div className="landing-hero-inner">
            <BrandMark size="hero" to="/" className="landing-hero-brand" />

            <p className="landing-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden />
              A living noticeboard built for you
            </p>

            <h1 className="landing-headline">
              Your wall,
              <br />
              everywhere.
            </h1>

            <p className="landing-lead">
              One dynamic canvas for your bio, README, and embeds — explore five sample walls below to see
              what yours could look like.
            </p>

            <div className="landing-claim-bar">
              <div className="landing-claim-input">
                <span className="landing-claim-prefix">wall.app/</span>
                <span className="landing-claim-name">devesh</span>
              </div>
              {user ? (
                <Link to="/edit" className="btn-neon btn-neon-lg landing-claim-cta">
                  Open your wall
                </Link>
              ) : (
                <Link to="/signup" className="btn-neon btn-neon-lg landing-claim-cta">
                  Get started free
                </Link>
              )}
            </div>

            {!user && (
              <p className="landing-claim-login">
                Already have a wall?{' '}
                <Link to="/login" className="landing-claim-login-link">
                  Log in
                </Link>
              </p>
            )}

            <a href="#canvas" className="landing-scroll-hint" aria-label="Scroll to sample walls">
              <span>Explore sample walls</span>
              <ChevronDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>

        <LandingMarquee />

        <section className="landing-section landing-canvas-section" id="canvas">
          <div className="landing-canvas-head">
            <h2>Five ways to use your wall</h2>
            <p>
              Creator profile, product launch, fitness coach, design studio, or local café — each layout is
              intentionally scattered, like a real canvas.
            </p>
          </div>
          <LandingCanvasShowcase />
          <p className="landing-section-note">
            Sign in to edit your own wall — the canvas editor unlocks after login.
          </p>
        </section>

        <section className="landing-band landing-band-lime" id="features">
          <div className="landing-band-inner landing-split">
            <div className="landing-split-copy">
              <h2>A living profile that updates automatically.</h2>
              <p>
                Embed Spotify, GitHub graphs, weather, and link previews on one 1600×1000 canvas — then
                share a single URL that stays in sync.
              </p>
              <Link to="/signup" className="btn-neon btn-neon-dark inline-flex items-center gap-2">
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <article className="landing-band-card">
              <Target className="landing-band-icon" aria-hidden />
              <h3>Real widgets, real layout</h3>
              <p>Drag sticky notes, images, QR codes, and live widgets with inspector controls.</p>
              <div className="landing-tags landing-tags-dark">
                <span>#IndieWeb</span>
                <span>#GithubReadme</span>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-band landing-band-wine">
          <div className="landing-band-inner landing-split">
            <LandingFanCards />
            <div className="landing-split-copy landing-split-copy-light">
              <h2>Share your wall anywhere you like.</h2>
              <p>
                Add wall.app/devesh to GitHub READMEs, link-in-bio pages, email signatures, and personal
                sites. One canvas — every channel stays in sync.
              </p>
              <Link to="/signup" className="btn-neon btn-neon-light inline-flex items-center gap-2">
                Claim your wall
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-band-inner landing-split landing-split-reverse">
            <div className="landing-split-copy">
              <h2>Analyze engagement and keep your wall alive.</h2>
              <p>
                Privacy-first view pings, reactions, and widget stats. Every save hits IndexedDB instantly
                — works offline after the first load.
              </p>
              <Link to="/signup" className="btn-neon inline-flex items-center gap-2">
                Start building
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="landing-stats-float">
              {[
                { n: '2.4k', l: 'views' },
                { n: '890', l: 'clicks' },
                { n: '98%', l: 'uptime' },
                { n: '24', l: 'widgets' },
              ].map(({ n, l }) => (
                <div key={l} className="landing-stats-float-card">
                  <strong>{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-trust-ticker">
          <p>
            The living canvas trusted by{' '}
            <span className="landing-trust-rotate" aria-hidden>
              {TRUST_WORDS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </span>
          </p>
        </section>

        <section className="landing-section landing-final-cta">
          <BrandMark size="lg" showText className="landing-final-brand" />
          <h2>Jumpstart your corner of the internet today.</h2>
          <Link to="/signup" className="btn-neon btn-neon-lg">
            Get started for free
          </Link>
        </section>
      </main>
    </div>
  )
}
