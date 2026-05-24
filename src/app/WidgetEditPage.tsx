import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Copy, ExternalLink } from 'lucide-react'
import { StandaloneWidgetView } from '@/ui/StandaloneWidgetView'
import { StatsDashboard } from '@/ui/StatsDashboard'
import { ShareEmbedPanel } from '@/ui/share/ShareEmbedPanel'
import { fetchWidget, updateStandaloneWidget } from '@/lib/widget-store'
import { useAuthStore } from '@/store/auth.store'
import { shareBaseUrl, versionedUrl } from '@/lib/share-urls'
import { type WidgetInstance, type WidgetTheme } from '@/types/widget-instance'
import { cn } from '@/lib/cn'

const TABS = ['Configure', 'Share', 'Embed', 'Track'] as const

export function WidgetEditPage() {
  const { widgetId } = useParams()
  const user = useAuthStore((s) => s.user)
  const [widget, setWidget] = useState<WidgetInstance | null>(null)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Configure')

  useEffect(() => {
    void (async () => {
      if (!widgetId) return
      const w = await fetchWidget(widgetId)
      setWidget(w)
    })()
  }, [widgetId])

  if (!widget) {
    return <div className="flex h-[100dvh] items-center justify-center bg-[#050508] text-neutral-400">Loading…</div>
  }

  const isOwner = !user || widget.ownerId === user.id || widget.ownerId === 'local'
  const publicUrl = versionedUrl(shareBaseUrl({ kind: 'widget', id: widget.id }), widget.shareVersion ?? 1)

  const saveTheme = async (patch: Partial<WidgetTheme>) => {
    const updated = await updateStandaloneWidget(widget, { theme: { ...widget.theme, ...patch } })
    setWidget(updated)
    toast.success('Saved')
  }

  const saveConfig = async (config: Record<string, unknown>) => {
    const updated = await updateStandaloneWidget(widget, { config: { ...widget.config, ...config } })
    setWidget(updated)
    toast.success('Saved')
  }

  const bumpVersion = async () => {
    const updated = await updateStandaloneWidget(widget, {
      shareVersion: (widget.shareVersion ?? 1) + 1,
    })
    setWidget(updated)
    toast.success('Share version bumped')
  }

  return (
    <div className="min-h-[100dvh] bg-[#050508] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#beee1d]">Standalone widget</p>
            <h1 className="text-xl font-black">{widget.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/5"
              onClick={() => {
                void navigator.clipboard.writeText(publicUrl)
                toast.success('Link copied')
              }}
            >
              <Copy className="mr-1 inline h-3.5 w-3.5" /> Copy link
            </button>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#beee1d] px-3 py-1.5 text-xs font-black text-black">
              <ExternalLink className="mr-1 inline h-3.5 w-3.5" /> Open
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-8">
          <StandaloneWidgetView widget={widget} readOnly={false} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold',
                  tab === t ? 'bg-[#beee1d] text-black' : 'bg-white/5 text-neutral-400',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Configure' && isOwner && (
            <div className="space-y-4">
              <label className="block text-xs text-neutral-500">
                Accent
                <input
                  type="color"
                  value={widget.theme.accent}
                  onChange={(e) => void saveTheme({ accent: e.target.value })}
                  className="mt-1 block h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </label>
              <label className="block text-xs text-neutral-500">
                Background
                <input
                  type="color"
                  value={widget.theme.background}
                  onChange={(e) => void saveTheme({ background: e.target.value })}
                  className="mt-1 block h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </label>
              <label className="block text-xs text-neutral-500">
                Label override
                <input
                  type="text"
                  defaultValue={String(widget.config.label ?? widget.config.title ?? '')}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  onBlur={(e) => void saveConfig({ label: e.target.value, title: e.target.value })}
                />
              </label>
              <button type="button" onClick={() => void bumpVersion()} className="text-xs text-[#beee1d] hover:underline">
                Bump share version (cache buster)
              </button>
            </div>
          )}

          {tab === 'Share' && (
            <div className="space-y-3 text-sm">
              <code className="block break-all rounded-lg bg-black/50 p-3 text-xs">{publicUrl}</code>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold"
                onClick={() => {
                  void navigator.clipboard.writeText(publicUrl)
                  toast.success('Copied')
                }}
              >
                Save & copy link
              </button>
            </div>
          )}

          {tab === 'Embed' && <ShareEmbedPanel subject={{ kind: 'widget', id: widget.id }} />}

          {tab === 'Track' && <StatsDashboard subject={{ kind: 'widget', id: widget.id }} />}
        </div>
      </div>

      {!isOwner && (
        <p className="pb-8 text-center text-xs text-neutral-600">
          <Link to="/login" className="text-[#beee1d]">Sign in</Link> to edit this widget.
        </p>
      )}
    </div>
  )
}
