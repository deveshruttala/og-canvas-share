import { useEditor, useValue } from '@tldraw/editor'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/types/canvas'
import { readWallTextBoxStyle } from '@/lib/wall-text-style'

/** Card-style backgrounds behind plain text boxes (page space, pans with canvas). */
export function WallTextBackdrops() {
  const editor = useEditor()

  const backdrops = useValue(
    'wall-text-backdrops',
    () => {
      void editor.getCamera()
      return editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'text')
        .map((s) => {
          const style = readWallTextBoxStyle(s.meta as Record<string, unknown>)
          if (style.mode !== 'card') return null
          const bounds = editor.getShapePageBounds(s.id)
          if (!bounds) return null
          return { id: s.id, bounds, cardBg: style.cardBg }
        })
        .filter(Boolean) as Array<{ id: string; bounds: { x: number; y: number; w: number; h: number }; cardBg: string }>
    },
    [editor],
  )

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      aria-hidden
    >
      {backdrops.map(({ id, bounds, cardBg }) => (
        <div
          key={id}
          className="wall-text-card-backdrop"
          style={{
            position: 'absolute',
            left: bounds.x - 10,
            top: bounds.y - 8,
            width: bounds.w + 20,
            height: bounds.h + 16,
            background: cardBg,
          }}
        />
      ))}
    </div>
  )
}
