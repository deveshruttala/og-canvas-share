/**
 * Session timeline — scrub undo history, undo/redo controls.
 */
import { History, Redo2, Undo2 } from 'lucide-react'
import { wallActions } from '@/editor/wall-actions'
import { getWallEditor } from '@/editor/wall-editor-api'
import { goToTimelineMark } from '@/editor/wall-timeline-history'
import { useWallHistory } from '@/editor/useWallHistory'
import { cn } from '@/lib/cn'

const MAX_DOTS = 10

export function SessionTimeline() {
  const { canUndo, canRedo, timeline } = useWallHistory()
  const dotCount = Math.max(1, Math.min(MAX_DOTS, timeline.total))
  const activeDot =
    timeline.total <= 1 ? 0 : Math.round((timeline.index / Math.max(1, timeline.total - 1)) * (dotCount - 1))

  const jumpToDot = (dotIndex: number) => {
    const editor = getWallEditor()
    if (!editor || timeline.total <= 1) return
    const targetMark = Math.round((dotIndex / Math.max(1, dotCount - 1)) * (timeline.total - 1))
    goToTimelineMark(editor, targetMark)
  }

  return (
    <div className="wall-session-timeline pointer-events-auto" role="toolbar" aria-label="Edit timeline">
      <History className="h-3.5 w-3.5 shrink-0 text-[#beee1d]" aria-hidden />
      <span className="wall-timeline-label">Timeline</span>

      <div className="wall-timeline-track" role="group" aria-label="History steps">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn('wall-timeline-node', i === activeDot && 'wall-timeline-node-active')}
            title={
              timeline.total > 1
                ? `Step ${i + 1} of ${dotCount} (${timeline.index + 1}/${timeline.total} edits)`
                : 'Make an edit to build history'
            }
            disabled={timeline.total <= 1 && i > 0}
            onClick={() => jumpToDot(i)}
            aria-label={`Go to history step ${i + 1}`}
            aria-current={i === activeDot ? 'step' : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!canUndo}
        className="wall-timeline-btn"
        onClick={() => wallActions.undo()}
        title="Undo (⌘Z)"
        aria-label="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        className="wall-timeline-btn"
        onClick={() => wallActions.redo()}
        title="Redo (⌘⇧Z)"
        aria-label="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
