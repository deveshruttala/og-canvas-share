/**
 * BYO AI key setup — provider, model, API key (saved locally once).
 */
import { useEffect, useState } from 'react'
import { X, KeyRound, ExternalLink } from 'lucide-react'
import {
  AI_PROVIDER_OPTIONS,
  defaultModelFor,
  isAiConfigured,
  loadAiConfig,
  saveAiConfig,
  clearAiConfig,
  type AiProvider,
} from '@/lib/ai-config'
import { useUiStore } from '@/store/ui.store'
import toast from 'react-hot-toast'

type Props = {
  onboarding?: boolean
  onConfigured?: () => void
}

export function AiSettingsModal({ onboarding = false, onConfigured }: Props) {
  const open = useUiStore((s) => s.showAiSettings)
  const setOpen = useUiStore((s) => s.setShowAiSettings)

  const existing = loadAiConfig()
  const [provider, setProvider] = useState<AiProvider>(existing?.provider ?? 'openai')
  const [model, setModel] = useState(existing?.model ?? defaultModelFor('openai'))
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? '')

  useEffect(() => {
    if (open || onboarding) {
      const cfg = loadAiConfig()
      if (cfg) {
        setProvider(cfg.provider)
        setModel(cfg.model)
        setApiKey(cfg.apiKey)
      }
    }
  }, [open, onboarding])

  const visible = open || onboarding
  if (!visible) return null

  const providerMeta = AI_PROVIDER_OPTIONS[provider]

  const save = () => {
    if (!apiKey.trim()) {
      toast.error('Enter your API key')
      return
    }
    saveAiConfig({ provider, model, apiKey: apiKey.trim() })
    toast.success(`${providerMeta.label} connected`)
    setOpen(false)
    onConfigured?.()
  }

  const handleClose = () => {
    if (onboarding && !isAiConfigured()) {
      onConfigured?.()
      return
    }
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#beee1d]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#beee1d]">
              {onboarding ? 'Set up AI Assistant' : 'AI Settings'}
            </h3>
          </div>
          {!onboarding && (
            <button type="button" onClick={handleClose} className="rounded-full p-2 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-5 p-5">
          {onboarding && (
            <p className="text-xs leading-relaxed text-neutral-400">
              Connect your own API key to power the creative canvas agent. Keys stay in your browser only — set up once,
              use forever.
            </p>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as AiProvider
                setProvider(p)
                setModel(defaultModelFor(p))
              }}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#beee1d]/50"
            >
              {(Object.keys(AI_PROVIDER_OPTIONS) as AiProvider[]).map((p) => (
                <option key={p} value={p}>
                  {AI_PROVIDER_OPTIONS[p].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#beee1d]/50"
            >
              {providerMeta.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={providerMeta.keyHint}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 font-mono text-sm text-emerald-400 outline-none placeholder:text-neutral-600 focus:border-[#beee1d]/50"
            />
            <p className="text-[10px] text-neutral-500">
              Stored locally in your browser only.{' '}
              <a
                href={providerMeta.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#beee1d] hover:underline"
              >
                Get a key <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-800 bg-black/40 px-5 py-4">
          {!onboarding && isAiConfigured() && (
            <button
              type="button"
              onClick={() => {
                clearAiConfig()
                setApiKey('')
                toast.success('API key removed')
              }}
              className="text-xs text-neutral-500 hover:text-red-400"
            >
              Remove key
            </button>
          )}
          <div className="ml-auto flex gap-2">
            {onboarding && (
              <button
                type="button"
                onClick={() => onConfigured?.()}
                className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:text-white"
              >
                Skip for now
              </button>
            )}
            <button type="button" onClick={save} className="wall-btn-neon px-5 py-2.5 text-xs">
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
