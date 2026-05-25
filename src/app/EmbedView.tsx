import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WallTldrawEditor } from '@/editor/WallTldrawEditor'
import { useCanvasStore } from '@/store/canvas.store'
import { loadPublishedWall, publicWallSlug } from '@/lib/publish-wall'
import { isLocalAuth } from '@/lib/auth/config'
import { api } from '@/lib/api'
import { loadCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID } from '@/persist/constants'
import { recordPing } from '@/lib/stats-client'
import '@/styles/public-viewer.css'

export function EmbedView() {
  const { username } = useParams()
  const hydrate = useCanvasStore((s) => s.hydrate)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    void (async () => {
      const name = publicWallSlug(username ?? '')

      if (isLocalAuth()) {
        const published = await loadPublishedWall(name)
        if (published) {
          hydrate(published)
          setState('ready')
          void recordPing({ kind: 'wall', id: name }, 'embed')
          return
        }
        if (name === 'local') {
          const legacy = await loadCanvas(LOCAL_CANVAS_ID)
          if (legacy?.meta?.publishedAt) {
            hydrate(legacy)
            setState('ready')
            void recordPing({ kind: 'wall', id: 'local' }, 'embed')
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
            if (name) void recordPing({ kind: 'wall', id: name }, 'embed')
            return
          }
        } catch {
          /* fallback */
        }
      }

      setState('missing')
    })()
  }, [username, hydrate])

  if (state === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-page)] text-[var(--text-tertiary)]">
        Loading…
      </div>
    )
  }

  if (state === 'missing') {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-page)] px-6 text-center text-sm text-[var(--text-secondary)]">
        This wall isn&apos;t published yet.
      </div>
    )
  }

  return (
    <div className="public-viewer-shell">
      <div className="public-viewer-rotate">
        <WallTldrawEditor readOnly className="wall-public-view h-full w-full" />
      </div>
    </div>
  )
}
