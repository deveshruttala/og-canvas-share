import type { CanvasElement } from '@/types/canvas'
import type { WidgetInstance } from '@/types/widget-instance'
import { WIDGET_CATALOG } from '@/widgets/catalog'
import { getSoundPadSize, type SoundPadData } from '@/lib/sound-pad-samples'
import { WIDGET_FONT_FAMILY, WIDGET_RADIUS_PX } from '@/types/widget-instance'

export function widgetInstanceToElement(widget: WidgetInstance): CanvasElement {
  const catalog = WIDGET_CATALOG.find((w) => w.id === widget.widgetId)
  const template = catalog?.template ?? 'clock'

  const baseStyle = {
    bg: widget.theme.surface,
    color: widget.theme.text,
    gradient: widget.theme.background,
    borderRadius: WIDGET_RADIUS_PX[widget.theme.radius],
    fontFamily: WIDGET_FONT_FAMILY[widget.theme.font],
  }

  if (template === 'progress') {
    return {
      id: widget.id,
      type: 'widget',
      x: 0,
      y: 0,
      w: widget.size.w,
      h: widget.size.h,
      rotation: 0,
      z: 1,
      content: widget.config,
      style: baseStyle,
    }
  }

  if (template === 'soundpad') {
    return {
      id: widget.id,
      type: 'audio',
      x: 0,
      y: 0,
      w: widget.size.w,
      h: widget.size.h,
      rotation: 0,
      z: 1,
      content: widget.config,
      style: baseStyle,
    }
  }

  if (template === 'polaroid') {
    return {
      id: widget.id,
      type: 'image',
      x: 0,
      y: 0,
      w: widget.size.w,
      h: widget.size.h,
      rotation: 0,
      z: 1,
      content: widget.config,
      style: { ...baseStyle, bg: '#faf8f5' },
    }
  }

  if (template === 'qr') {
    return {
      id: widget.id,
      type: 'qr',
      x: 0,
      y: 0,
      w: widget.size.w,
      h: widget.size.h,
      rotation: 0,
      z: 1,
      content: widget.config,
      style: baseStyle,
    }
  }

  if (template === 'sticky') {
    return {
      id: widget.id,
      type: 'text',
      x: 0,
      y: 0,
      w: widget.size.w,
      h: widget.size.h,
      rotation: 0,
      z: 1,
      content: { text: String(widget.config.text ?? 'Note') },
      style: baseStyle,
    }
  }

  return {
    id: widget.id,
    type: 'widget',
    x: 0,
    y: 0,
    w: widget.size.w,
    h: widget.size.h,
    rotation: 0,
    z: 1,
    content: {
      type: template === 'clock' || template === 'weather' || template === 'spotify' || template === 'github'
        ? template
        : 'clock',
      ...widget.config,
    },
    style: baseStyle,
  }
}

export function wallMetaToWidgetConfig(meta: {
  wallType?: string
  wallData?: Record<string, unknown>
  wallStyle?: { gradient?: string }
}): { widgetId: string; config: Record<string, unknown>; size: { w: number; h: number } } | null {
  if (!meta.wallType || !meta.wallData) return null
  const data = meta.wallData
  if (meta.wallType === 'widget') {
    const type = String(data.type ?? 'clock')
    const match = WIDGET_CATALOG.find((w) => w.template === type)
    return {
      widgetId: match?.id ?? `clock-utc`,
      config: data,
      size: { w: 320, h: 200 },
    }
  }
  if (meta.wallType === 'progress') {
    const match = WIDGET_CATALOG.find((w) => w.template === 'progress')
    return { widgetId: match?.id ?? 'progress-water', config: data, size: { w: 300, h: 120 } }
  }
  if (meta.wallType === 'soundpad') {
    const sound = typeof data.sound === 'string' ? data.sound : ''
    const match =
      WIDGET_CATALOG.find((w) => w.template === 'soundpad' && w.config?.sound === sound) ??
      WIDGET_CATALOG.find((w) => w.template === 'soundpad')
    return {
      widgetId: match?.id ?? 'soundpad-rain',
      config: data,
      size: getSoundPadSize(data as SoundPadData),
    }
  }
  if (meta.wallType === 'polaroid') {
    const match = WIDGET_CATALOG.find((w) => w.template === 'polaroid')
    return { widgetId: match?.id ?? 'polaroid-vacation', config: data, size: { w: 260, h: 320 } }
  }
  if (meta.wallType === 'qr') {
    const match = WIDGET_CATALOG.find((w) => w.template === 'qr')
    return { widgetId: match?.id ?? 'qr-portfolio', config: data, size: { w: 200, h: 200 } }
  }
  if (meta.wallType === 'audio') {
    const match = WIDGET_CATALOG.find((w) => w.id.includes('spotify') || w.template === 'spotify')
    return { widgetId: match?.id ?? 'spotify-now', config: data, size: { w: 320, h: 180 } }
  }
  return null
}
