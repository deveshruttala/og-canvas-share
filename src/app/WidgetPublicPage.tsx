import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StandaloneWidgetView } from '@/ui/StandaloneWidgetView'
import { fetchWidget } from '@/lib/widget-store'
import { recordPing } from '@/lib/stats-client'
import type { WidgetInstance } from '@/types/widget-instance'

export function WidgetPublicPage() {
  const { widgetId } = useParams()
  const [widget, setWidget] = useState<WidgetInstance | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    void (async () => {
      if (!widgetId) {
        setState('missing')
        return
      }
      const w = await fetchWidget(widgetId)
      if (!w) {
        setState('missing')
        return
      }
      setWidget(w)
      setState('ready')
      void recordPing({ kind: 'widget', id: widgetId }, 'view')
    })()
  }, [widgetId])

  if (state === 'loading') {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#050508] text-neutral-400">
        Loading widget…
      </div>
    )
  }

  if (state === 'missing' || !widget) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-[#050508] px-6 text-center text-white">
        <h1 className="text-2xl font-black">Widget not found</h1>
        <p className="text-neutral-500">This standalone widget doesn&apos;t exist or is private.</p>
        <Link to="/widgets" className="text-[#beee1d] hover:underline">
          Browse widgets
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#050508] p-6">
      <StandaloneWidgetView widget={widget} />
      <p className="mt-6 text-xs text-neutral-600">
        <Link to={`/w/${widget.id}/edit`} className="hover:text-[#beee1d]">
          Configure
        </Link>
        {' · '}
        <Link to={`/w/${widget.id}/embed`} className="hover:text-[#beee1d]">
          Embed
        </Link>
      </p>
    </div>
  )
}
