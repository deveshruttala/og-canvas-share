/**
 * Expanded share modal — Link, Image, Embed, Social, Track, QR, API tabs.
 */
import { lazy, Suspense, useState } from 'react'
import { X, Copy, Download, Share2, ExternalLink, RefreshCw } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas.store'
import type { CanvasDoc } from '@/types/canvas'
import { useUiStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { exportCanvasToPng } from '@/render/exportPng'
import { ShareEmbedPanel } from '@/ui/share/ShareEmbedPanel'
import { StatsDashboard } from '@/ui/StatsDashboard'
import { cn } from '@/lib/cn'
import toast from 'react-hot-toast'
import {
  embedUrl,
  jsonUrl,
  linkedInInspectorUrl,
  pngUrl,
  shareBaseUrl,
  sseUrl,
  svgUrl,
  versionedUrl,
  wallliveUrl,
} from '@/lib/share-urls'
import { api, isApiConfigured } from '@/lib/api'
import { isLocalAuth } from '@/lib/auth/config'
import {
  canPublishWalls,
  publicWallSlug,
  publishWallLocally,
  saveWallDraftLocally,
  syncPublishedSnapshot,
} from '@/lib/publish-wall'
import { prepareDocForShare, resolveWallExportElement } from '@/lib/wall-share-prep'
import { getWallEditor, zoomToWallPage } from '@/editor/wall-editor-api'

const LinkedInWizard = lazy(() => import('@/ui/LinkedInWizard').then((m) => ({ default: m.LinkedInWizard })))

const TABS = ['Link', 'Image', 'Embed', 'Social', 'Track', 'QR', 'API'] as const
type Tab = (typeof TABS)[number]

function copyText(text: string, label: string) {
  void navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

export function ShareModal() {
  const open = useUiStore((s) => s.showShareModal)
  const setOpen = useUiStore((s) => s.setShowShareModal)
  const doc = useCanvasStore((s) => s.doc)
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<Tab>('Link')
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  if (!open) return null

  const username = user ? publicWallSlug(user.username) : 'local'
  const subject = { kind: 'wall' as const, id: username }
  const shareVersion = (doc.meta as { shareVersion?: number }).shareVersion ?? 1
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = versionedUrl(shareBaseUrl(subject, origin), shareVersion)
  const embed = embedUrl(subject, origin)

  const bumpVersion = async () => {
    const fresh = await prepareDocForShare()
    const next = shareVersion + 1
    const bumped = {
      ...fresh,
      meta: { ...fresh.meta, shareVersion: next, updatedAt: new Date().toISOString() },
    }
    useCanvasStore.setState({ doc: bumped })
    if (user && isApiConfigured()) {
      try {
        await api.saveWall(user.username, bumped)
      } catch {
        /* local ok */
      }
    } else if (user && isLocalAuth()) {
      await saveWallDraftLocally(user.username, bumped)
      if (bumped.meta.publishedAt) {
        await syncPublishedSnapshot(user.username, bumped)
      }
    }
    toast.success(`Version bumped to v${next}`)
  }

  const publishWall = async () => {
    if (!user) {
      toast.error('Sign in to publish your wall')
      return
    }
    if (!canPublishWalls()) {
      toast.error('Publishing is not available in this environment')
      return
    }
    try {
      const fresh = await prepareDocForShare()
      const now = new Date().toISOString()
      const toPublish: CanvasDoc = {
        ...fresh,
        meta: { ...fresh.meta, updatedAt: now, publishedAt: now },
      }
      let published: CanvasDoc
      if (isLocalAuth()) {
        published = await publishWallLocally(user.username, toPublish)
      } else {
        published = toPublish
      }
      if (isApiConfigured()) {
        try {
          await api.saveWall(publicWallSlug(user.username), published)
        } catch (apiErr) {
          if (!isLocalAuth()) throw apiErr
          console.warn('[publish] API save failed; local snapshot saved', apiErr)
        }
      }
      useCanvasStore.setState({ doc: published })
      toast.success(`Wall published! Open ${publicUrl}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Publish failed'
      toast.error(msg)
    }
  }

  const downloadPng = async (url?: string) => {
    if (url) {
      window.open(url, '_blank')
      return
    }
    const editor = getWallEditor()
    if (editor) zoomToWallPage(editor, { animate: false })
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

    const el = resolveWallExportElement()
    if (!el) {
      toast.error('Canvas not found — open the editor first')
      return
    }
    try {
      await exportCanvasToPng(el, `${doc.title.replace(/\s+/g, '-').toLowerCase() || 'wall'}.png`)
      toast.success('PNG downloaded')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed'
      toast.error(msg)
    }
  }

  const loadQr = async () => {
    if (qrDataUrl) return
    const QRCode = await import('qrcode')
    const data = await QRCode.toDataURL(publicUrl, { margin: 2, width: 280 })
    setQrDataUrl(data)
  }

  if (showLinkedIn) {
    return (
      <Suspense fallback={null}>
        <LinkedInWizard
          subject={subject}
          title={doc.title}
          shareVersion={shareVersion}
          onClose={() => setShowLinkedIn(false)}
          onBumpVersion={() => void bumpVersion()}
        />
      </Suspense>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-neutral-900 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#beee1d]" />
            <h2 className="text-lg font-bold text-white">Share your wall</h2>
          </div>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 pt-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                if (t === 'QR') void loadQr()
              }}
              className={cn('shrink-0 rounded-t-lg px-3 py-2 text-xs font-bold', tab === t ? 'bg-white/10 text-white' : 'text-white/40')}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-sm text-white/80">
          {tab === 'Link' && (
            <div className="space-y-4">
              {!user && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Sign in to publish at /u/yourname
                </p>
              )}
              {user && isLocalAuth() && !(doc.meta as { publishedAt?: string }).publishedAt && (
                <p className="rounded-lg bg-[#beee1d]/10 px-3 py-2 text-xs text-[#beee1d]">
                  Click <strong>Publish wall</strong> to make this link live on this device (saved in your browser).
                </p>
              )}
              {user && (doc.meta as { publishedAt?: string }).publishedAt && (
                <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  Published — visitors can open your wall at the link below.
                </p>
              )}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">Public URL (v{shareVersion})</p>
                <div className="flex gap-2">
                  <code className="flex-1 truncate rounded-lg bg-black/50 px-3 py-2 text-xs">{publicUrl}</code>
                  <button type="button" className="rounded-lg bg-white/10 px-3" onClick={() => copyText(publicUrl, 'Link')}>
                    <Copy className="h-4 w-4" />
                  </button>
                  <a href={publicUrl} className="rounded-lg bg-white/10 px-3 py-2" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void bumpVersion()} className="flex items-center gap-1 rounded-lg border border-[#beee1d]/30 px-3 py-2 text-xs font-bold text-[#beee1d]">
                  <RefreshCw className="h-3.5 w-3.5" /> Bump version
                </button>
                {user && (
                  <button type="button" onClick={() => void publishWall()} className="rounded-lg bg-[#beee1d] px-3 py-2 text-xs font-black text-black">
                    Publish wall
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                Install{' '}
                <a href="https://github.com/wall-app/extension" className="text-[#beee1d] hover:underline" target="_blank" rel="noreferrer">
                  Wall Live extension
                </a>{' '}
                for live LinkedIn previews (Chrome/Firefox).
              </p>
            </div>
          )}

          {tab === 'Image' && (
            <div className="space-y-3">
              {[
                { label: 'Default 1600×1000', url: pngUrl(subject, undefined, origin) },
                { label: 'LinkedIn / OG 1200×630', url: pngUrl(subject, { og: true }, origin) },
                { label: 'Square 1080×1080', url: pngUrl(subject, { fmt: 'square' }, origin) },
                { label: 'Story 1080×1920', url: pngUrl(subject, { fmt: 'story' }, origin) },
                { label: 'Thumb 800×800', url: pngUrl(subject, { fmt: 'thumb' }, origin) },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => void downloadPng(item.url)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/10"
                >
                  <span>{item.label}</span>
                  <Download className="h-4 w-4 text-[#beee1d]" />
                </button>
              ))}
              <button type="button" onClick={() => void downloadPng()} className="w-full rounded-xl border border-dashed border-white/10 py-3 text-xs text-neutral-400">
                Download client PNG snapshot
              </button>
            </div>
          )}

          {tab === 'Embed' && <ShareEmbedPanel subject={subject} />}

          {tab === 'Social' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowLinkedIn(true)}
                className="w-full rounded-xl bg-[#0a66c2] py-3 text-sm font-bold text-white"
              >
                Share to LinkedIn wizard
              </button>
              <a
                href={linkedInInspectorUrl(publicUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-xs font-bold text-white/80 hover:bg-white/5"
              >
                Refresh on LinkedIn →
              </a>
              <p className="text-xs text-neutral-500">
                X may show stale previews for up to 7 days. Bump version for a fresh URL.
              </p>
            </div>
          )}

          {tab === 'Track' && <StatsDashboard subject={subject} />}

          {tab === 'QR' && (
            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code" className="rounded-xl bg-white p-3" />
              ) : (
                <button type="button" onClick={() => void loadQr()} className="rounded-lg bg-white/10 px-4 py-2 text-xs">
                  Generate QR
                </button>
              )}
              <p className="text-center text-xs text-neutral-500">Print-ready poster · scan to open wall</p>
            </div>
          )}

          {tab === 'API' && (
            <div className="space-y-3 font-mono text-xs">
              {[
                ['Wall Live discovery', wallliveUrl(subject, origin)],
                ['JSON state', jsonUrl(subject, origin)],
                ['SSE stream', sseUrl(subject, origin)],
                ['SVG render', svgUrl(subject, origin)],
                ['Embed iframe', embed],
              ].map(([label, url]) => (
                <div key={label} className="rounded-lg bg-black/40 p-3">
                  <p className="mb-1 text-[10px] uppercase text-neutral-500">{label}</p>
                  <div className="flex gap-2">
                    <code className="flex-1 break-all text-neutral-300">{url}</code>
                    <button type="button" onClick={() => copyText(url, label)} className="shrink-0 text-[#beee1d]">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-neutral-600">
                Docs: <a href="/docs/protocol" className="text-[#beee1d]">/docs/protocol</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
