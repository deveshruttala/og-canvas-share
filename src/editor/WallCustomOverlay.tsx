import { useEditor, useValue } from '@tldraw/editor'
import type { TLGeoShape } from '@tldraw/tlschema'
import { AudioElement } from '@/canvas/elements/AudioElement'
import { QrElement } from '@/canvas/elements/QrElement'
import { WidgetElement } from '@/canvas/elements/WidgetElement'
import { ProgressElement } from '@/canvas/elements/ProgressElement'
import { SoundPadElement } from '@/canvas/elements/SoundPadElement'
import { PolaroidElement } from '@/canvas/elements/PolaroidElement'
import { LinkCard } from '@/canvas/elements/LinkCard'
import { VideoElement } from '@/canvas/elements/VideoElement'
import { CodeCardElement } from '@/canvas/elements/CodeCardElement'
import { CalendarEmbedElement } from '@/canvas/elements/CalendarEmbedElement'
import { PollElement } from '@/canvas/elements/PollElement'
import { MapElement } from '@/canvas/elements/MapElement'
import { WallEmbedFrame } from '@/canvas/elements/WallEmbedFrame'
import { getWallOverlayLayout, type WallHostMeta } from '@/editor/wall-host-shape'
import {
  DEFAULT_AUDIO_PLAYER_THEME,
  DEFAULT_VIDEO_PLAYER_THEME,
  getAudioPlayerTheme,
  getVideoPlayerTheme,
} from '@/lib/wall-player-presets'
import { isAllowedEmbedIframeHost } from '@/lib/normalize-wall-url'
import { isEmbeddableUrl } from '@/lib/link-resolver'
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
    const data = meta.wallData as {
      src: string
      title?: string
      artist?: string
      cover?: string
      badge?: string
    }
    const themeId = meta.wallStyle?.playerThemeId ?? DEFAULT_AUDIO_PLAYER_THEME
    const theme = getAudioPlayerTheme(themeId)
    return {
      ...base,
      type: 'audio',
      content: data,
      style: {
        ...base.style,
        bg: theme.background,
        gradient: meta.wallStyle?.gradient ?? theme.background,
        color: theme.text,
        borderRadius: 16,
        playerThemeId: themeId,
      },
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
      type: 'clock' | 'weather' | 'spotify' | 'spotify_now' | 'github' | 'github_stats' | 'rss' | 'strava'
      label?: string
      location?: string
      timezone?: string
      repo?: string
      username?: string
      feedUrl?: string
      feedLimit?: number
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
  if (meta.wallType === 'video') {
    const data = meta.wallData as { src?: string; poster?: string; title?: string }
    const themeId = meta.wallStyle?.playerThemeId ?? DEFAULT_VIDEO_PLAYER_THEME
    const theme = getVideoPlayerTheme(themeId)
    return {
      ...base,
      type: 'video',
      content: data,
      style: {
        bg: theme.background,
        gradient: meta.wallStyle?.gradient,
        color: theme.text,
        borderRadius: 14,
        playerThemeId: themeId,
      },
    }
  }
  if (meta.wallType === 'code') {
    return {
      ...base,
      type: 'widget',
      content: meta.wallData as { code?: string; language?: string },
      style: base.style,
    }
  }
  if (meta.wallType === 'calendar') {
    return {
      ...base,
      type: 'embed',
      content: meta.wallData as { embedUrl: string },
      style: base.style,
    }
  }
  if (meta.wallType === 'embed') {
    const data = meta.wallData as { embedUrl: string; originalUrl?: string }
    return {
      ...base,
      type: 'embed',
      content: data,
      style: base.style,
    }
  }
  if (meta.wallType === 'poll') {
    return {
      ...base,
      type: 'widget',
      content: meta.wallData as {
        pollId: string
        question: string
        options: Array<{ id: string; emoji: string; label?: string }>
      },
      style: base.style,
    }
  }
  if (meta.wallType === 'map') {
    return {
      ...base,
      type: 'widget',
      content: meta.wallData as { lat: number; lng: number; zoom?: number; label?: string },
      style: base.style,
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

  const embedOverlays = useValue(
    'wall-embed-overlays',
    () => {
      void camera
      return editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'embed')
        .map((s) => {
          const props = s.props as { url?: string; w?: number; h?: number }
          const embedUrl = props.url?.trim() ?? ''
          if (!embedUrl || !isAllowedEmbedIframeHost(embedUrl) || !isEmbeddableUrl(embedUrl)) {
            return null
          }
          const layout = getWallOverlayLayout(editor, {
            id: s.id,
            x: s.x,
            y: s.y,
            rotation: s.rotation,
            props: { w: props.w ?? 400, h: props.h ?? 280 },
          })
          return { shapeId: s.id, embedUrl, layout }
        })
        .filter(Boolean) as Array<{
        shapeId: string
        embedUrl: string
        layout: ReturnType<typeof getWallOverlayLayout>
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
            {wallType === 'audio' && (
              <div className="pointer-events-auto h-full w-full">
                <AudioElement element={el} selected={selected} />
              </div>
            )}
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
            {wallType === 'video' && (
              <div className="pointer-events-auto h-full w-full">
                <VideoElement element={el} selected={selected} />
              </div>
            )}
            {wallType === 'code' && <CodeCardElement element={el} selected={selected} />}
            {wallType === 'calendar' && (
              <CalendarEmbedElement
                embedUrl={(el.content as { embedUrl: string }).embedUrl}
                selected={selected}
              />
            )}
            {wallType === 'embed' && (
              <div className="wall-embed-overlay pointer-events-auto h-full w-full">
                <WallEmbedFrame
                  embedUrl={(el.content as { embedUrl: string }).embedUrl}
                  selected={selected}
                  readOnly={readOnly}
                />
              </div>
            )}
            {wallType === 'poll' && (
              <div className="wall-interactive-overlay h-full w-full">
                <PollElement
                  pollId={(el.content as { pollId: string }).pollId}
                  question={(el.content as { question: string }).question}
                  options={(el.content as { options: Array<{ id: string; emoji: string; label?: string }> }).options}
                  readOnly={readOnly}
                  selected={selected}
                />
              </div>
            )}
            {wallType === 'map' && (
              <MapElement
                lat={(el.content as { lat: number }).lat}
                lng={(el.content as { lng: number }).lng}
                zoom={(el.content as { zoom?: number }).zoom}
                label={(el.content as { label?: string }).label}
                selected={selected}
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

      {embedOverlays.map(({ shapeId, embedUrl, layout }) => {
        const selected = selectedIds.has(shapeId as never)
        return (
          <div
            key={`embed-${shapeId}`}
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
            <div className="wall-embed-overlay pointer-events-auto h-full w-full">
              <WallEmbedFrame embedUrl={embedUrl} selected={selected} readOnly={readOnly} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
