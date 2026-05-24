/**
 * Session timeline — visual undo/redo scrubber with history depth.
 */
import { useEffect, useState } from 'react'
import { Undo2, Redo2, History } from 'lucide-react'
import { wallActions } from '@/editor/wall-actions'
import { onHistoryChange } from '@/editor/wall-editor-api'

export function SessionTimeline() {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const refresh = () => {
      setCanUndo(wallActions.canUndo())
      setCanRedo(wallActions.canRedo())
      setPulse((p) => p + 1)
    }
    refresh()
    return onHistoryChange(refresh)
  }, [])

  return (
    <div className="wall-session-timeline pointer-events-auto">
      <History className="h-3.5 w-3.5 text-[#beee1d]" />
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Timeline</span>

      <div className="wall-timeline-track" key={pulse}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="wall-timeline-node"
            style={{
              opacity: canUndo && i < 6 ? 0.35 + (i / 12) * 0.65 : 0.15,
              background: i === 5 ? '#beee1d' : undefined,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!canUndo}
        className="wall-timeline-btn"
        onClick={() => wallActions.undo()}
        title="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        className="wall-timeline-btn"
        onClick={() => wallActions.redo()}
        title="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
