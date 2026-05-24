import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StandaloneWidgetView } from '@/ui/StandaloneWidgetView'
import { fetchWidget } from '@/lib/widget-store'
import { recordPing } from '@/lib/stats-client'
import type { WidgetInstance } from '@/types/widget-instance'

/** iframe-friendly embed — no chrome */
export function WidgetEmbedPage() {
  const { widgetId } = useParams()
  const [widget, setWidget] = useState<WidgetInstance | null>(null)

  useEffect(() => {
    void (async () => {
      if (!widgetId) return
      const w = await fetchWidget(widgetId)
      setWidget(w)
      if (w) void recordPing({ kind: 'widget', id: widgetId }, 'embed')
    })()
  }, [widgetId])

  if (!widget) {
    return <div className="h-[100dvh] bg-[#050508]" />
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-transparent p-2">
      <StandaloneWidgetView widget={widget} />
    </div>
  )
}
