/**
 * Vector scribble studio — brush size, neon color, opacity, stabilizer.
 */
import { DefaultColorStyle, DefaultSizeStyle } from '@tldraw/tlschema'
import { useUiStore } from '@/store/ui.store'
import { getWallEditor } from '@/editor/wall-editor-api'
import { cn } from '@/lib/cn'

/** Full tldraw color palette for scribbles. */
const NEON_COLORS = [
  { id: 'light-green', label: 'Neon', swatch: '#beee1d' },
  { id: 'yellow', label: 'Gold', swatch: '#facc15' },
  { id: 'light-blue', label: 'Cyan', swatch: '#22d3ee' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { id: 'light-violet', label: 'Violet', swatch: '#a78bfa' },
  { id: 'violet', label: 'Purple', swatch: '#8b5cf6' },
  { id: 'light-red', label: 'Pink', swatch: '#f472b6' },
  { id: 'red', label: 'Red', swatch: '#ef4444' },
  { id: 'orange', label: 'Orange', swatch: '#f97316' },
  { id: 'green', label: 'Green', swatch: '#22c55e' },
  { id: 'grey', label: 'Grey', swatch: '#94a3b8' },
  { id: 'black', label: 'Ink', swatch: '#fafafa' },
  { id: 'white', label: 'White', swatch: '#ffffff' },
] as const

const SIZES = [
  { id: 's', label: 'Fine' },
  { id: 'm', label: 'Med' },
  { id: 'l', label: 'Bold' },
  { id: 'xl', label: 'Thick' },
] as const

export function DrawBrushPanel() {
  const activeTool = useUiStore((s) => s.activeTool)
  const brushColor = useUiStore((s) => s.brushColor)
  const brushSize = useUiStore((s) => s.brushSize)
  const brushOpacity = useUiStore((s) => s.brushOpacity)
  const brushStabilizer = useUiStore((s) => s.brushStabilizer)
  const setBrushColor = useUiStore((s) => s.setBrushColor)
  const setBrushSize = useUiStore((s) => s.setBrushSize)
  const setBrushOpacity = useUiStore((s) => s.setBrushOpacity)
  const setBrushStabilizer = useUiStore((s) => s.setBrushStabilizer)

  if (activeTool !== 'drawing') return null

  const applyToEditor = (color: string, size: string) => {
    const editor = getWallEditor()
    if (!editor) return
    editor.setStyleForNextShapes(DefaultColorStyle, color as never)
    editor.setStyleForNextShapes(DefaultSizeStyle, size as never)
  }

  return (
    <div className="wall-brush-panel pointer-events-auto">
      <span className="wall-brush-label">Scribble</span>

      <div className="flex max-w-[min(100vw-8rem,28rem)] flex-wrap items-center gap-1">
        {NEON_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            className={cn(
              'wall-brush-swatch',
              brushColor === c.id && 'wall-brush-swatch-active',
              c.id === 'white' && 'ring-1 ring-white/30',
            )}
            style={{ background: c.swatch, opacity: brushOpacity }}
            onClick={() => {
              setBrushColor(c.id)
              applyToEditor(c.id, brushSize)
            }}
          />
        ))}
      </div>

      <div className="flex gap-1">
        {SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={cn(
              'wall-brush-size-btn',
              brushSize === s.id && 'wall-brush-size-btn-active',
            )}
            onClick={() => {
              setBrushSize(s.id)
              applyToEditor(brushColor, s.id)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="wall-brush-slider-label">
        Opacity
        <input
          type="range"
          min={0.25}
          max={1}
          step={0.05}
          value={brushOpacity}
          onChange={(e) => setBrushOpacity(Number(e.target.value))}
          className="wall-brush-slider"
        />
      </label>

      <label className="wall-brush-slider-label">
        Stabilizer
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={brushStabilizer}
          onChange={(e) => setBrushStabilizer(Number(e.target.value))}
          className="wall-brush-slider"
        />
      </label>
    </div>
  )
}
