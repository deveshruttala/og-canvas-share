import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WallTldrawEditor } from '@/editor/WallTldrawEditor'
import { Logo } from '@/ui/Logo'
import { PublicWallChrome } from '@/ui/PublicWallChrome'
import { useCanvasStore } from '@/store/canvas.store'
import { loadCanvas } from '@/persist/db'
import { api } from '@/lib/api'
import { recordPing } from '@/lib/stats-client'
import '@/styles/public-viewer.css'

export function PublicViewer() {
  const { username } = useParams()
  const hydrate = useCanvasStore((s) => s.hydrate)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    void (async () => {
      if (username === 'local') {
        const doc = await loadCanvas('local')
        if (doc) {
          hydrate(doc)
          setState('ready')
          void recordPing({ kind: 'wall', id: 'local' }, 'view')
          return
        }
      }

      try {
        const remote = await api.getWall(username ?? '')
        if (remote) {
          hydrate(remote)
          setState('ready')
          if (username) void recordPing({ kind: 'wall', id: username }, 'view')
          return
        }
      } catch {
        /* fallback */
      }

      setState('missing')
    })()
  }, [username, hydrate])

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
        <h1 className="font-display text-3xl sm:text-4xl">@{username}</h1>
        <p className="mt-3 max-w-md text-[var(--text-secondary)]">
          This wall isn&apos;t published yet. Try{' '}
          <Link to="/u/local" className="text-[var(--accent-text)] hover:underline">
            /u/local
          </Link>{' '}
          for your saved local wall.
        </p>
        <Link to="/edit" className="btn-primary mt-8">
          Edit your wall
        </Link>
      </div>
    )
  }

  return (
    <div className="public-viewer-shell">
      <div className="public-viewer-rotate">
        <WallTldrawEditor readOnly className="wall-public-view h-full w-full" />
        <PublicWallChrome username={username} />
      </div>
    </div>
  )
}
