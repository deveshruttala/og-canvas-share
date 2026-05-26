import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WallTldrawEditor } from '@/editor/WallTldrawEditor'
import { WallThemeBackground } from '@/editor/WallThemeBackground'
import { Logo } from '@/ui/Logo'
import { PublicWallChrome } from '@/ui/PublicWallChrome'
import { useCanvasStore } from '@/store/canvas.store'
import { loadCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID } from '@/persist/constants'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/types/canvas'
import { api } from '@/lib/api'
import { isLocalAuth } from '@/lib/auth/config'
import { loadPublishedWall, publicWallSlug } from '@/lib/publish-wall'
import { recordPing } from '@/lib/stats-client'
import '@/styles/public-viewer.css'

export function PublicViewer() {
  const { username } = useParams()
  const hydrate = useCanvasStore((s) => s.hydrate)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  // Strip image/format extensions if someone navigated to `/u/foo.png` or
  // `/u/foo.json` directly — the viewer route should treat those as the same
  // user as `/u/foo`. Without this we'd look up "foo.png" in the DB and
  // always miss, showing "wall isn't published yet" after a real publish.
  const rawUsername = username ?? ''
  const cleanUsername = rawUsername.replace(/\.(png|svg|json|jpg|jpeg|webp)$/i, '')

  useEffect(() => {
    void (async () => {
      const name = publicWallSlug(cleanUsername)

      if (isLocalAuth()) {
        const published = await loadPublishedWall(name)
        if (published) {
          hydrate(published)
          setState('ready')
          void recordPing({ kind: 'wall', id: name }, 'view')
          return
        }
        if (name === 'local') {
          const legacy = await loadCanvas(LOCAL_CANVAS_ID)
          if (legacy?.meta?.publishedAt) {
            hydrate(legacy)
            setState('ready')
            void recordPing({ kind: 'wall', id: 'local' }, 'view')
            return
          }
        }
      }

      if (!isLocalAuth() || import.meta.env.VITE_API_URL) {
        try {
          const remote = await api.getWall(name)
          if (remote) {
            hydrate(remote)
            setState('ready')
            if (name) void recordPing({ kind: 'wall', id: name }, 'view')
            return
          }
        } catch {
          /* fallback */
        }
      }

      setState('missing')
    })()
  }, [cleanUsername, hydrate])

  if (state === 'loading') {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-[var(--bg-page)] text-[var(--text-secondary)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
        <p className="text-sm">Loading wall…</p>
      </div>
    )
  }

  if (state === 'missing') {
    return (
      <div className="page-shell flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <Logo size="lg" to="/" className="mb-8 [&_span]:text-[var(--text-primary)]" />
        <h1 className="font-display text-3xl sm:text-4xl">@{cleanUsername}</h1>
        <p className="mt-3 max-w-md text-[var(--text-secondary)]">
          This wall isn&apos;t published yet. Open the editor, use Share → Publish wall, then return here.
          {isLocalAuth() ? (
            <>
              {' '}
              <Link to="/edit" className="text-[var(--accent-text)] hover:underline">
                Go to editor
              </Link>
            </>
          ) : null}
        </p>
        <Link to="/edit" className="btn-primary mt-8">
          Edit your wall
        </Link>
      </div>
    )
  }

  return <PublicViewerStage username={cleanUsername} />
}

/**
 * Public viewer stage — CSS-cover scales a fixed 1600×1000 tldraw canvas so it
 * fills the viewport in both dimensions (cropping the longer axis if needed).
 * No camera math, no zoom controls; we just transform the wrapper.
 *
 * Mobile (≤640px wide + touch + portrait): the stage rotates 90° so a
 * landscape wall still fills the phone vertically.
 */
function PublicViewerStage({ username }: { username: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [rotated, setRotated] = useState(false)

  useLayoutEffect(() => {
    const apply = () => {
      const isMobile =
        window.matchMedia('(max-width: 640px) and (orientation: portrait) and (pointer: coarse)').matches
      setRotated(isMobile)
      const vw = window.innerWidth
      const vh = window.innerHeight
      const [w, h] = isMobile ? [vh, vw] : [vw, vh]
      // FIT (contain): the full 1600×1000 canvas always stays visible. Bands
      // around it are painted with the theme workspace background so the
      // letterbox is invisible. Math.min ensures we never crop content.
      const next = Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT)
      setScale(next)
    }
    apply()
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])

  return (
    <div className="public-viewer-shell" ref={stageRef}>
      {/* Full-viewport workspace background — same gradient that surrounds the
       * artboard in the editor, painted edge-to-edge so the letterbox bands
       * around the 1600×1000 page blend seamlessly with the theme. */}
      <WallThemeBackground />
      <div className={`public-viewer-rotate${rotated ? ' public-viewer-rotate--mobile' : ''}`}>
        <div
          className="public-viewer-stage"
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <WallTldrawEditor readOnly className="wall-public-view h-full w-full" />
        </div>
      </div>
      <PublicWallChrome username={username} />
    </div>
  )
}
