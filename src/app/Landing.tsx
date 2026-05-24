/**
 * Landing — dark neon marketing page inspired by Linktree-style sections.
 */
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowRight, BarChart3, Layers, Share2, Sparkles, Target, Wifi } from 'lucide-react'
import { SiteHeader } from '@/ui/SiteHeader'
import { SiteFooter } from '@/ui/SiteFooter'
import { LandingCanvasShowcase } from '@/ui/LandingCanvasShowcase'
import { useAuthStore } from '@/store/auth.store'
import '@/styles/landing.css'

const TEMPLATES = [
  { author: 'alex', title: 'Now Page', tag: 'IndieWeb', gradient: 'from-sky-500/40 to-transparent' },
  { author: 'sam', title: 'Portfolio', tag: 'GitHub Readme', gradient: 'from-violet-500/40 to-transparent' },
  { author: 'jamie', title: 'Event Flyer', tag: 'Embed System', gradient: 'from-amber-500/40 to-transparent' },
]

const TRUST = ['creators', 'developers', 'designers', 'founders', 'streamers', 'musicians']

export function Landing() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  return (
    <div className="landing-page">
      <SiteHeader />

      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <p className="landing-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden />
              Personal noticeboard for the open web
            </p>
            <h1 className="landing-headline">
              Built
              <br />
              for you.
            </h1>
            <p className="landing-lead">
              Create high-contrast dynamic noticeboard walls. Share them everywhere. Our image endpoint
              automatically updates every linked embed on GitHub, personal pages, or signatures.
            </p>
            <div className="landing-hero-cta">
              <Link to="/signup" className="btn-neon">
                Get started for free
              </Link>
              <a href="#canvas" className="btn-outline">
                Explore live canvas
              </a>
            </div>
          </div>
        </section>

        <section className="landing-section landing-canvas-section">
          <LandingCanvasShowcase />
          <p className="landing-section-note">
            Sign in to edit your own wall — the canvas editor unlocks after login.
          </p>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-bento">
            <article className="landing-bento-card landing-bento-neon">
              <Target className="landing-bento-icon" aria-hidden />
              <h2>A living profile page that updates automatically.</h2>
              <p>
                Embed Spotify tracks, GitHub graphs, weather, and link previews on one 1600×1000 canvas —
                then share a single URL.
              </p>
              <div className="landing-tags">
                <span>#IndieWeb</span>
                <span>#GithubReadme</span>
              </div>
            </article>
            <article className="landing-bento-card landing-bento-dark">
              <BarChart3 className="landing-bento-icon" aria-hidden />
              <h2>Granular controls. Real widgets.</h2>
              <p>
                Drag sticky notes, images, QR codes, and live widgets. Inspector tools for angle, layers,
                gradients, and standalone embeds.
              </p>
              <div className="landing-tags">
                <span>#NixtioGrid</span>
                <span>#EmbedSystem</span>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-section landing-split">
          <div className="landing-split-copy">
            <h2>Share your wall anywhere you like.</h2>
            <p>
              Add your unique Wall URL to GitHub READMEs, Linktree bios, email signatures, and personal
              sites. One canvas — every channel stays in sync.
            </p>
            <Link to="/signup" className="btn-neon inline-flex items-center gap-2">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="landing-split-visual">
            <div className="landing-share-stack">
              <span>README.md</span>
              <span>link.bio</span>
              <span>email sig</span>
              <span className="landing-share-highlight">wall.app/you</span>
            </div>
          </div>
        </section>

        <section className="landing-section landing-split landing-split-reverse">
          <div className="landing-split-visual landing-stats-grid">
            <div>
              <strong>6.4k</strong>
              <span>views</span>
            </div>
            <div>
              <strong>3.2k</strong>
              <span>clicks</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>uptime</span>
            </div>
            <div>
              <strong>24</strong>
              <span>widgets</span>
            </div>
          </div>
          <div className="landing-split-copy">
            <h2>Analyze engagement and keep your wall alive.</h2>
            <p>
              Privacy-first view pings, reactions, and widget stats. Every save hits IndexedDB instantly —
              works offline after the first load.
            </p>
            <Link to="/signup" className="btn-neon inline-flex items-center gap-2">
              Claim your wall
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="landing-section landing-trust">
          <h2>
            The living canvas trusted by <span className="landing-trust-accent">{TRUST[0]}</span>
          </h2>
          <div className="landing-trust-row">
            {TRUST.map((word) => (
              <span key={word} className="landing-trust-pill">
                {word}
              </span>
            ))}
          </div>
        </section>

        <section className="landing-section" id="templates">
          <div className="landing-section-head">
            <h2>Example walls</h2>
            <p>Portfolio, now page, or event flyer — start from a template after you sign in.</p>
          </div>
          <div className="landing-template-grid">
            {TEMPLATES.map((t) => (
              <article key={t.author} className="landing-template-card">
                <div className={`landing-template-art bg-gradient-to-b ${t.gradient}`} />
                <div className="landing-template-body">
                  <p className="landing-template-user">@{t.author}</p>
                  <h3>{t.title}</h3>
                  <span className="landing-template-tag">{t.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-features-row">
          {[
            { icon: Layers, title: 'One canvas', body: 'One person, one wall — public to view, yours to edit.' },
            { icon: Wifi, title: 'Local-first', body: 'IndexedDB saves instantly. Offline after first load.' },
            { icon: Share2, title: 'Share anywhere', body: 'PNG export, live embeds, and Wall Live protocol.' },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="landing-feature-card">
              <Icon className="h-5 w-5 text-[#beee1d]" aria-hidden />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="landing-section landing-final-cta">
          <h2>Jumpstart your corner of the internet today.</h2>
          <Link to="/signup" className="btn-neon btn-neon-lg">
            Get started for free
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

