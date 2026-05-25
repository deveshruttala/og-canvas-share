import { useState } from 'react'
import { X, KeyRound, ExternalLink } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { loadProviderKeys, mergeProviderKeys, type ProviderKeys } from '@/lib/provider-config'
import toast from 'react-hot-toast'

const FIELDS: Array<{
  key: keyof ProviderKeys
  label: string
  hint: string
  docs: string
}> = [
  {
    key: 'pixabay',
    label: 'Pixabay',
    hint: 'API Key (recommended)',
    docs: 'https://pixabay.com/api/docs/',
  },
  { key: 'pexels', label: 'Pexels', hint: 'API Key', docs: 'https://www.pexels.com/api/' },
  { key: 'unsplash', label: 'Unsplash', hint: 'Access Key', docs: 'https://unsplash.com/developers' },
  { key: 'giphy', label: 'Giphy', hint: 'API Key', docs: 'https://developers.giphy.com/' },
  { key: 'tenor', label: 'Tenor', hint: 'API Key', docs: 'https://developers.google.com/tenor' },
  { key: 'freesound', label: 'Freesound', hint: 'API Token', docs: 'https://freesound.org/apiv2/apply' },
]

export function ConnectionsModal() {
  const open = useUiStore((s) => s.showConnections)
  const setOpen = useUiStore((s) => s.setShowConnections)
  const [keys, setKeys] = useState<ProviderKeys>(() => loadProviderKeys())

  if (!open) return null

  const save = () => {
    mergeProviderKeys(keys)
    toast.success('Connections saved locally')
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--bg-muted)] px-5 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="font-display text-lg">Connections</h3>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-5 pt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          Keys stay in your browser only — proxied locally, never on our servers. No key: Wikimedia, Met
          Museum, Art Institute, Iconify, iTunes music previews, Mixkit SFX. Pixabay covers images + audio;
          Pexels/Unsplash for stock; Giphy/Tenor for GIFs; Freesound for SFX.
        </p>

        <div className="space-y-4 p-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">{f.label}</label>
              <input
                type="password"
                value={keys[f.key] ?? ''}
                onChange={(e) => setKeys((k) => ({ ...k, [f.key]: e.target.value }))}
                placeholder={f.hint}
                className="w-full rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-subtle)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <a
                href={f.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-[var(--accent-text)] hover:underline"
              >
                Get key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--bg-muted)] px-5 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          <button type="button" onClick={save} className="btn-primary px-5 py-2 text-xs">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
