/**
 * Public viewer: open linkTo URLs when clicking linked shapes.
 */
import { useEffect } from 'react'
import { useEditor } from '@tldraw/editor'
import { WALL_FRAME_ID } from '@/editor/wall-editor-api'

type LinkMeta = { url: string; label?: string; openInNewTab?: boolean }

export function WallLinkHandler({ enabled }: { enabled?: boolean }) {
  const editor = useEditor()

  useEffect(() => {
    if (!enabled) return

    const handler = () => {
      const ids = editor.getSelectedShapeIds()
      if (ids.length !== 1) return
      const id = ids[0]
      if (id === WALL_FRAME_ID) return
      const shape = editor.getShape(id)
      const linkTo = shape?.meta?.linkTo as LinkMeta | undefined
      if (!linkTo?.url) return
      window.open(linkTo.url, linkTo.openInNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer')
    }

    const unsub = editor.store.listen(handler, { source: 'user', scope: 'session' })
    return unsub
  }, [editor, enabled])

  return null
}
