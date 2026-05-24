import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WallTldrawEditor } from '@/editor/WallTldrawEditor'
import { useCanvasStore } from '@/store/canvas.store'
import { loadCanvas } from '@/persist/db'
import '@/styles/public-viewer.css'

export function EmbedView() {
  const { username } = useParams()
  const hydrate = useCanvasStore((s) => s.hydrate)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      if (username === 'local') {
        const doc = await loadCanvas('local')
        if (doc) {
          hydrate(doc)
          setReady(true)
        }
      }
    })()
  }, [username, hydrate])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-page)] text-[var(--text-tertiary)]">
        Loading…
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
