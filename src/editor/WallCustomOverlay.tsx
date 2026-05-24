import { useEditor, useValue } from '@tldraw/editor'
import type { TLGeoShape } from '@tldraw/tlschema'
import { AudioElement } from '@/canvas/elements/AudioElement'
import { QrElement } from '@/canvas/elements/QrElement'
import { WidgetElement } from '@/canvas/elements/WidgetElement'
import { ProgressElement } from '@/canvas/elements/ProgressElement'
import { SoundPadElement } from '@/canvas/elements/SoundPadElement'
import { PolaroidElement } from '@/canvas/elements/PolaroidElement'
import type { CanvasElement } from '@/types/canvas'
import { cn } from '@/lib/cn'

type WallMeta = {
  wallType?: 'audio' | 'qr' | 'widget' | 'progress' | 'soundpad' | 'polaroid'
  wallData?: Record<string, unknown>
  wallStyle?: { gradient?: string }
}

function shapeToCanvasElement(shape: TLGeoShape): CanvasElement | null {
  const meta = shape.meta as WallMeta
  if (!meta.wallType || !meta.wallData) return null

  const base = {
    id: shape.id,
    x: shape.x,
    y: shape.y,
    w: shape.props.w,
    h: shape.props.h,
    rotation: shape.rotation * (180 / Math.PI),
    z: 1,
    style: {
      bg: meta.wallStyle?.gradient ?? '#0d0e12',
      gradient: meta.wallStyle?.gradient,
    },
  }

  if (meta.wallType === 'audio') {
    return {
      ...base,
      type: 'audio',
      content: meta.wallData as { src: string; title?: string },
      style: { ...base.style, bg: '#0d0e12', color: '#fafafa', borderRadius: 16 },
    }
  }
  if (meta.wallType === 'qr') {
    return {
      ...base,
      type: 'qr',
      content: meta.wallData as { url: string },
      style: { bg: '#fff', borderRadius: 8 },
    }
  }
  if (meta.wallType === 'widget') {
    return {
      ...base,
      type: 'widget',
      content: meta.wallData as { type: 'clock' | 'weather' | 'spotify' | 'github' },
      style: { ...base.style, bg: meta.wallStyle?.gradient ?? '#0d0e12', color: '#fafafa', borderRadius: 16 },
    }
  }
  if (meta.wallType === 'progress') {
    return {
      ...base,
      type: 'widget',
      content: meta.wallData as Record<string, unknown>,
      style: base.style,
    }
  }
  if (meta.wallType === 'soundpad') {
    return {
      ...base,
      type: 'audio',
      content: meta.wallData as Record<string, unknown>,
      style: base.style,
    }
  }
  if (meta.wallType === 'polaroid') {
    return {
      ...base,
      type: 'image',
      content: meta.wallData as { src?: string; caption?: string },
      style: { bg: '#faf8f5', borderRadius: 4 },
    }
  }
  return null
}

/** HTML overlay for wall-specific shapes (audio, QR, widgets) on top of tldraw canvas */
export function WallCustomOverlay({ readOnly }: { readOnly?: boolean }) {
  const editor = useEditor()

  const overlays = useValue(
    'wall-overlays',
    () =>
      editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'geo' && (s.meta as WallMeta)?.wallType)
        .map((s) => {
          const bounds = editor.getShapePageBounds(s.id)
          if (!bounds) return null
          const meta = s.meta as WallMeta
          const el = shapeToCanvasElement(s as TLGeoShape)
          if (!el) return null
          const screen = editor.pageToScreen({ x: bounds.x, y: bounds.y })
          const zoom = editor.getZoomLevel()
          return { el, screen, zoom, shapeId: s.id, wallType: meta.wallType }
        })
        .filter(Boolean) as Array<{
        el: CanvasElement
        screen: { x: number; y: number }
        zoom: number
        shapeId: string
        wallType: WallMeta['wallType']
      }>,
    [editor],
  )

  const updateWallData = (shapeId: string, patch: Record<string, unknown>) => {
    const shape = editor.getShape(shapeId as never)
    if (!shape) return
    const meta = shape.meta as WallMeta
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      meta: { ...meta, wallData: { ...meta.wallData, ...patch } } as typeof shape.meta,
    })
  }

  const selectedIds = useValue(
    'wall-overlay-selection',
    () => new Set(editor.getSelectedShapeIds()),
    [editor],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-[300] overflow-hidden">
      {overlays.map(({ el, screen, zoom, shapeId, wallType }) => {
        const selected = selectedIds.has(shapeId as never)
        return (
          <div
            key={el.id}
            className={cn(
              'pointer-events-none absolute origin-top-left wall-overlay-shell',
              selected && 'wall-overlay-selected',
            )}
          style={{
            left: screen.x,
            top: screen.y,
            width: el.w * zoom,
            height: el.h * zoom,
            transform: `rotate(${el.rotation}deg)`,
          }}
        >
          {wallType === 'audio' && <AudioElement element={el} selected={selected} />}
          {wallType === 'qr' && <QrElement element={el} />}
          {wallType === 'widget' && <WidgetElement element={el} />}
          {wallType === 'progress' && <ProgressElement element={el} />}
          {wallType === 'soundpad' && <SoundPadElement element={el} readOnly={readOnly} />}
          {wallType === 'polaroid' && (
            <PolaroidElement
              element={el}
              readOnly={readOnly}
              onCaptionChange={(caption) => updateWallData(shapeId, { caption })}
            />
          )}
        </div>
        )
      })}
    </div>
  )
}
