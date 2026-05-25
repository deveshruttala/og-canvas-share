/**
 * Active alignment guides — dashed green snap lines while dragging shapes.
 */
import { useEffect, useState } from 'react'
import { useEditor, useValue } from '@tldraw/editor'
import { WALL_FRAME_ID } from '@/editor/wall-editor-api'

const SNAP_THRESHOLD = 8

type Guide = { axis: 'x' | 'y'; value: number; from: number; to: number }

function collectGuides(
  movingBounds: { x: number; y: number; w: number; h: number },
  others: Array<{ x: number; y: number; w: number; h: number }>,
): Guide[] {
  const guides: Guide[] = []
  const mx = [movingBounds.x, movingBounds.x + movingBounds.w / 2, movingBounds.x + movingBounds.w]
  const my = [movingBounds.y, movingBounds.y + movingBounds.h / 2, movingBounds.y + movingBounds.h]

  for (const ob of others) {
    const ox = [ob.x, ob.x + ob.w / 2, ob.x + ob.w]
    const oy = [ob.y, ob.y + ob.h / 2, ob.y + ob.h]

    for (const a of mx) {
      for (const b of ox) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
          const minY = Math.min(movingBounds.y, ob.y) - 20
          const maxY = Math.max(movingBounds.y + movingBounds.h, ob.y + ob.h) + 20
          guides.push({ axis: 'x', value: b, from: minY, to: maxY })
        }
      }
    }
    for (const a of my) {
      for (const b of oy) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
          const minX = Math.min(movingBounds.x, ob.x) - 20
          const maxX = Math.max(movingBounds.x + movingBounds.w, ob.x + ob.w) + 20
          guides.push({ axis: 'y', value: b, from: minX, to: maxX })
        }
      }
    }
  }

  return guides
}

export function WallSnapGuides() {
  const editor = useEditor()
  const [guides, setGuides] = useState<Guide[]>([])

  const dragging = useValue(
    'wall-dragging',
    () => editor.inputs.isDragging,
    [editor],
  )

  useEffect(() => {
    if (!dragging) {
      setGuides([])
      return
    }

    const tick = () => {
      const selected = editor.getSelectedShapeIds().filter((id) => id !== WALL_FRAME_ID)
      if (selected.length !== 1) {
        setGuides([])
        return
      }
      const moving = editor.getShapePageBounds(selected[0])
      if (!moving) {
        setGuides([])
        return
      }

      const others = editor
        .getCurrentPageShapes()
        .filter((s) => s.id !== WALL_FRAME_ID && !selected.includes(s.id))
        .map((s) => editor.getShapePageBounds(s.id))
        .filter(Boolean) as Array<{ x: number; y: number; w: number; h: number }>

      setGuides(collectGuides(moving, others))
    }

    tick()
    const id = window.setInterval(tick, 32)
    return () => window.clearInterval(id)
  }, [dragging, editor])

  if (!guides.length) return null

  return (
    <svg className="wall-snap-guides pointer-events-none absolute inset-0 z-[250] h-full w-full overflow-visible">
      {guides.map((g, i) => {
        if (g.axis === 'x') {
          const a = editor.pageToViewport({ x: g.value, y: g.from })
          const b = editor.pageToViewport({ x: g.value, y: g.to })
          return (
            <line
              key={`${g.axis}-${g.value}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="wall-snap-line"
            />
          )
        }
        const a = editor.pageToViewport({ x: g.from, y: g.value })
        const b = editor.pageToViewport({ x: g.to, y: g.value })
        return (
          <line
            key={`${g.axis}-${g.value}-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="wall-snap-line"
          />
        )
      })}
    </svg>
  )
}
