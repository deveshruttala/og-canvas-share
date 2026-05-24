import { useState } from 'react'
import { X, ExternalLink, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ShareSubject } from '@/lib/share-urls'
import { linkedInInspectorUrl, linkedInShareIntent, pngUrl, shareBaseUrl, versionedUrl } from '@/lib/share-urls'

const CAPTIONS = [
  (u: string) => `I made a living wall — it updates wherever it's embedded. Take a look 👇 ${u}`,
  (u: string) => `New on my wall today — peek here: ${u}`,
  (u: string) => `Currently shipping on my wall: ${u}`,
]

type Props = {
  subject: ShareSubject
  title: string
  shareVersion: number
  onClose: () => void
  onBumpVersion: () => void
}

export function LinkedInWizard({ subject, title, shareVersion, onClose, onBumpVersion }: Props) {
  const [step, setStep] = useState(1)
  const [captionIdx, setCaptionIdx] = useState(0)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = versionedUrl(shareBaseUrl(subject, origin), shareVersion)
  const ogImage = pngUrl(subject, { og: true }, origin)
  const caption = CAPTIONS[captionIdx]!(url)

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Share to LinkedIn</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              We&apos;ll generate a 1200×630 snapshot optimized for LinkedIn with your wall title.
            </p>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
              <img src={ogImage} alt="" className="aspect-[1200/630] w-full object-cover" />
              <div className="border-t border-white/10 p-3">
                <p className="font-serif text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-[#beee1d]">Updated today · View live →</p>
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full rounded-xl bg-[#0a66c2] py-3 text-sm font-bold">
              Next: Caption
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-xs text-neutral-500">Caption</label>
            <textarea
              className="h-28 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white"
              value={caption}
              readOnly
            />
            <button
              type="button"
              className="text-xs text-[#beee1d]"
              onClick={() => setCaptionIdx((i) => (i + 1) % CAPTIONS.length)}
            >
              Try another variant
            </button>
            <button type="button" onClick={() => setStep(3)} className="w-full rounded-xl bg-[#0a66c2] py-3 text-sm font-bold">
              Next: Versioned URL
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <code className="block break-all rounded-lg bg-black/50 p-3 text-xs">{url}</code>
            <button
              type="button"
              onClick={() => {
                onBumpVersion()
                toast.success('Fresh URL ready for scrapers')
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#beee1d]/30 py-2 text-xs font-bold text-[#beee1d]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Bump version first
            </button>
            <a
              href={linkedInShareIntent(url, caption)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a66c2] py-3 text-sm font-bold text-white"
            >
              Open LinkedIn share <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={linkedInInspectorUrl(url)}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs text-neutral-500 hover:text-white"
            >
              Preview looking stale? Open Post Inspector →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
