import type { WidgetInstance } from '@/types/widget-instance'
import { widgetInstanceToElement } from '@/lib/widget-render'
import { AudioElement } from '@/canvas/elements/AudioElement'
import { QrElement } from '@/canvas/elements/QrElement'
import { WidgetElement } from '@/canvas/elements/WidgetElement'
import { ProgressElement } from '@/canvas/elements/ProgressElement'
import { SoundPadElement } from '@/canvas/elements/SoundPadElement'
import { PolaroidElement } from '@/canvas/elements/PolaroidElement'
import { WIDGET_CATALOG } from '@/widgets/catalog'

type Props = {
  widget: WidgetInstance
  readOnly?: boolean
  className?: string
}

export function StandaloneWidgetView({ widget, readOnly = true, className }: Props) {
  const el = widgetInstanceToElement(widget)
  const catalog = WIDGET_CATALOG.find((w) => w.id === widget.widgetId)
  const template = catalog?.template

  const shellStyle = {
    width: widget.size.w,
    height: widget.size.h,
    maxWidth: '100%',
    background: widget.theme.background,
    color: widget.theme.text,
    fontFamily: widget.theme.font === 'mono' ? 'ui-monospace, monospace' : undefined,
    borderRadius: widget.theme.radius === 'lg' ? 16 : widget.theme.radius === 'md' ? 12 : 8,
    boxShadow:
      widget.theme.shadow === 'lifted'
        ? '0 24px 48px rgba(0,0,0,0.45)'
        : widget.theme.shadow === 'soft'
          ? '0 8px 24px rgba(0,0,0,0.25)'
          : 'none',
  }

  return (
    <div className={className} style={shellStyle}>
      {el.type === 'audio' ? (
        <AudioElement element={el} />
      ) : template === 'qr' ? (
        <QrElement element={el} />
      ) : template === 'progress' ? (
        <ProgressElement element={el} />
      ) : template === 'soundpad' ? (
        <SoundPadElement element={el} readOnly={readOnly} />
      ) : template === 'polaroid' ? (
        <PolaroidElement element={el} readOnly={readOnly} />
      ) : (
        <WidgetElement element={el} />
      )}
    </div>
  )
}
