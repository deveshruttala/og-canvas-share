/**
 * Landing page — hero, live demo canvas, example walls, feature cards.
 * Demo canvas uses in-memory state only (id: demo, never persisted).
 */
import { useEffect, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Layers, Wifi, Share2 } from 'lucide-react'
import { Logo } from '@/ui/Logo'
import { useCanvasStore } from '@/store/canvas.store'
import { DEMO_CANVAS_ID } from '@/persist/constants'
import {
  createEmptyCanvas,
  createImageElement,
  createLinkElement,
  createTextElement,
  type CanvasDoc,
  type ThemeId,
} from '@/types/canvas'
import { getTheme } from '@/themes'

const WallTldrawEditor = lazy(() =>
  import('@/editor/WallTldrawEditor').then((m) => ({ default: m.WallTldrawEditor })),
)

/** Pre-built stickies for the landing demo — resets on "Reset demo" */
const DEMO_ELEMENTS = [
  createTextElement(120, 140, 'Welcome to your wall 👋'),
  createTextElement(420, 280, 'Drag me around!\nTap to edit text.'),
  createLinkElement(800, 160, 'https://github.com', {
    title: 'GitHub',
    description: 'Where the world builds software',
  }),
  createImageElement(
    900,
    420,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'Abstract art',
  ),
]

/** Showcase cards — live gist walls ship in Phase 2 */
const EXAMPLE_WALLS: Array<{
  title: string
  author: string
  theme: ThemeId
  description: string
}> = [
  {
    title: 'Now Page',
    author: 'alex',
    theme: 'whiteboard',
    description: 'What I’m focused on this month — links, goals, and a photo.',
  },
  {
    title: 'Portfolio',
    author: 'sam',
    theme: 'glass',
    description: 'Projects, GitHub links, and a short bio sticky.',
  },
  {
    title: 'Event Flyer',
    author: 'jamie',
    theme: 'corkboard',
    description: 'Date, venue, QR code, and bold headline stickies.',
  },
]

const FEATURES = [
  {
    icon: Layers,
    title: 'One canvas',
    body: 'Not Figma. Not Miro. One person, one wall — public to view, yours to edit.',
  },
  {
    icon: Wifi,
    title: 'Local-first',
    body: 'Every save hits IndexedDB instantly. Works offline after the first load.',
  },
  {
    icon: Share2,
    title: 'Share anywhere',
    body: 'Export PNG today. GitHub sync and live embeds coming in Phase 2.',
  },
]

function buildDemoDoc(): CanvasDoc {
  const doc = createEmptyCanvas(DEMO_CANVAS_ID)
  doc.title = 'Demo Wall'
  doc.theme = 'corkboard'
  doc.elements = DEMO_ELEMENTS.map((el, i) => ({ ...el, z: i }))
  return doc
}

/** Interactive demo — hydrates global store with demo id (no IndexedDB writes) */
function DemoCanvas() {
  const hydrate = useCanvasStore((s) => s.hydrate)

  useEffect(() => {
    hydrate(buildDemoDoc())
  }, [hydrate])

  return (
    <div className="surface-card relative overflow-hidden shadow-glow sm:rounded-wall-lg">
      <div className="absolute inset-x-0 top-0 z-10 border-b border-white/5 bg-black/30 px-4 py-2 text-center text-xs text-white/45 backdrop-blur-sm">
        Live preview — drag stickies below
      </div>
      <div className="h-[min(420px,55vh)] min-h-[280px] pt-8 sm:h-[440px]">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-white/40">Loading demo…</div>
          }
        >
          <WallTldrawEditor />
        </Suspense>
      </div>
    </div>
  )
}

function ExampleWallCard({ wall }: { wall: (typeof EXAMPLE_WALLS)[number] }) {
  const theme = getTheme(wall.theme)
  return (
    <article className="surface-card group overflow-hidden transition hover:border-white/20 hover:shadow-wall">
      <div
        className="h-28 border-b border-white/5 transition group-hover:opacity-95 sm:h-32"
        style={{ background: theme.background }}
      />
      <div className="p-4 sm:p-5">
        <p className="text-xs font-medium text-wall-accent/90">@{wall.author}</p>
        <h3 className="mt-1 font-display text-lg">{wall.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{wall.description}</p>
        <span className="mt-3 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/35">
          Coming Phase 2
        </span>
      </div>
    </article>
  )
}

export function Landing() {
  const [demoKey, setDemoKey] = useState(0)

  return (
    <div className="page-shell">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-wall-black/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo size="md" />
          <Link to="/edit" className="btn-primary shrink-0 px-4 py-2 text-sm sm:px-5">
            Open editor
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-content px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        {/* Hero */}
        <section className="mb-14 text-center sm:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-wall-accent/20 bg-wall-accent/10 px-3 py-1 text-xs font-medium text-wall-accent-light">
            <Sparkles className="h-3.5 w-3.5" />
            Personal noticeboard for the open web
          </div>
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            A living wall for
            <br className="hidden sm:block" />
            <span className="text-wall-accent-light"> the open web</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
            Drag stickers, photos, and links onto your board. Share it as a link or a self-updating
            image embed.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link to="/edit" className="btn-primary w-full sm:w-auto">
              Claim your wall
            </Link>
            <button type="button" onClick={() => setDemoKey((k) => k + 1)} className="btn-ghost w-full sm:w-auto">
              Reset demo
            </button>
          </div>
        </section>

        {/* Live demo */}
        <section className="mb-16 sm:mb-20">
          <div key={demoKey}>
            <DemoCanvas />
          </div>
          <p className="mt-3 text-center text-xs text-white/35">
            Nothing leaves your browser until you save in the editor.
          </p>
        </section>

        {/* Example walls grid */}
        <section className="mb-16 sm:mb-20">
          <h2 className="font-display text-2xl sm:text-3xl">Example walls</h2>
          <p className="mt-2 max-w-md text-sm text-white/45">
            Inspiration for what you can build — portfolio, now page, event flyer.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_WALLS.map((wall) => (
              <ExampleWallCard key={wall.author} wall={wall} />
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-card p-5 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-wall bg-wall-accent/15 text-wall-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/35">
        No signup required to play. GitHub only when you want to save publicly.
      </footer>
    </div>
  )
}
