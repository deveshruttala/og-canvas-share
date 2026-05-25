import { useEditor, useValue } from '@tldraw/editor'
import type { TLGeoShape } from '@tldraw/tlschema'
import { AudioElement } from '@/canvas/elements/AudioElement'
import { QrElement } from '@/canvas/elements/QrElement'
import { WidgetElement } from '@/canvas/elements/WidgetElement'
import { ProgressElement } from '@/canvas/elements/ProgressElement'
import { SoundPadElement } from '@/canvas/elements/SoundPadElement'
import { PolaroidElement } from '@/canvas/elements/PolaroidElement'
import { LinkCard } from '@/canvas/elements/LinkCard'
import { getWallOverlayLayout, type WallHostMeta } from '@/editor/wall-host-shape'
import { toJsonMeta } from '@/lib/json-meta'
import type { CanvasElement } from '@/types/canvas'
import { cn } from '@/lib/cn'

function shapeToCanvasElement(shape: TLGeoShape): CanvasElement | null {
  const meta = shape.meta as WallHostMeta
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
    const data = meta.wallData as {
      type: 'clock' | 'weather' | 'spotify' | 'github'
      label?: string
      location?: string
      timezone?: string
      repo?: string
    }
    return {
      ...base,
      type: 'widget',
      content: data,
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
  if (meta.wallType === 'link') {
    const data = meta.wallData as {
      url: string
      title?: string
      description?: string
      image?: string
    }
    return {
      ...base,
      type: 'link',
      content: {
        url: data.url,
        title: data.title ?? data.url,
        description: data.description,
        image: data.image,
      },
      style: {
        bg: meta.wallStyle?.gradient ?? '#1a1d26',
        color: '#fafafa',
        borderRadius: 12,
      },
    }
  }
  return null
}

/** HTML overlay for wall-specific shapes (audio, QR, widgets) on top of tldraw canvas */
export function WallCustomOverlay({ readOnly }: { readOnly?: boolean }) {
  const editor = useEditor()

  const camera = useValue('wall-overlay-camera', () => editor.getCamera(), [editor])

  const overlays = useValue(
    'wall-overlays',
    () => {
      void camera
      return editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'geo' && (s.meta as WallHostMeta)?.wallType)
        .map((s) => {
          const geo = s as TLGeoShape
          const el = shapeToCanvasElement(geo)
          if (!el) return null
          const layout = getWallOverlayLayout(editor, geo)
          const meta = geo.meta as WallHostMeta
          return { el, layout, shapeId: geo.id, wallType: meta.wallType }
        })
        .filter(Boolean) as Array<{
        el: CanvasElement
        layout: ReturnType<typeof getWallOverlayLayout>
        shapeId: string
        wallType: WallHostMeta['wallType']
      }>
    },
    [editor, camera],
  )

  const updateWallData = (shapeId: string, patch: Record<string, unknown>) => {
    const shape = editor.getShape(shapeId as never)
    if (!shape) return
    const meta = shape.meta as WallHostMeta
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      meta: toJsonMeta({ ...meta, wallData: { ...meta.wallData, ...patch } }),
    })
  }

  const selectedIds = useValue(
    'wall-overlay-selection',
    () => new Set(editor.getSelectedShapeIds()),
    [editor],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-[120] overflow-hidden">
      {overlays.map(({ el, layout, shapeId, wallType }) => {
        const selected = selectedIds.has(shapeId as never)
        return (
          <div
            key={shapeId}
            className={cn(
              'pointer-events-none absolute origin-top-left wall-overlay-shell',
              selected && 'wall-overlay-selected',
            )}
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.width,
              height: layout.height,
              transform: layout.rotationDeg ? `rotate(${layout.rotationDeg}deg)` : undefined,
              transformOrigin: 'top left',
            }}
          >
            {wallType === 'audio' && <AudioElement element={el} selected={selected} />}
            {wallType === 'qr' && <QrElement element={el} selected={selected} />}
            {wallType === 'widget' && <WidgetElement element={el} selected={selected} />}
            {wallType === 'progress' && <ProgressElement element={el} />}
            {wallType === 'soundpad' && <SoundPadElement element={el} readOnly={readOnly} />}
            {wallType === 'polaroid' && (
              <PolaroidElement
                element={el}
                readOnly={readOnly}
                onCaptionChange={(caption) => updateWallData(shapeId, { caption })}
              />
            )}
            {wallType === 'link' && (
              <div className="wall-link-overlay h-full w-full">
                <LinkCard element={el} selected={selected} readOnly />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
