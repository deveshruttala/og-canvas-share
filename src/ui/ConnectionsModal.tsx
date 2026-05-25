import { useState } from 'react'
import { X, KeyRound, ExternalLink, Music2, Activity } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { loadProviderKeys, mergeProviderKeys, type ProviderKeys } from '@/lib/provider-config'
import {
  loadIntegrationKeys,
  mergeIntegrationKeys,
  type IntegrationKeys,
} from '@/lib/integration-keys'
import {
  clearSpotifyTokens,
  loadSpotifyTokens,
  spotifyConfigured,
  startSpotifyLogin,
} from '@/lib/spotify-auth'
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
    hint: 'API Key (audio search only)',
    docs: 'https://pixabay.com/api/docs/',
  },
  { key: 'pexels', label: 'Pexels', hint: 'API Key', docs: 'https://www.pexels.com/api/' },
  { key: 'unsplash', label: 'Unsplash', hint: 'Access Key', docs: 'https://unsplash.com/developers' },
  { key: 'giphy', label: 'Giphy', hint: 'API Key', docs: 'https://developers.giphy.com/' },
  { key: 'tenor', label: 'Tenor', hint: 'API Key', docs: 'https://developers.google.com/tenor' },
  { key: 'freesound', label: 'Freesound', hint: 'API Token', docs: 'https://freesound.org/apiv2/apply' },
]

const INTEGRATION_FIELDS: Array<{
  key: keyof IntegrationKeys
  label: string
  hint: string
  docs: string
}> = [
  {
    key: 'jamendo',
    label: 'Jamendo',
    hint: 'Client ID (full CC tracks)',
    docs: 'https://devportal.jamendo.com/',
  },
  {
    key: 'strava',
    label: 'Strava',
    hint: 'Personal access token',
    docs: 'https://www.strava.com/settings/api',
  },
]

export function ConnectionsModal() {
  const open = useUiStore((s) => s.showConnections)
  const setOpen = useUiStore((s) => s.setShowConnections)
  const [keys, setKeys] = useState<ProviderKeys>(() => loadProviderKeys())
  const [integrations, setIntegrations] = useState<IntegrationKeys>(() => loadIntegrationKeys())
  const [spotifyLinked, setSpotifyLinked] = useState(() => Boolean(loadSpotifyTokens()))

  if (!open) return null

  const save = () => {
    mergeProviderKeys(keys)
    mergeIntegrationKeys(integrations)
    toast.success('Connections saved locally')
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
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
          Keys stay in your browser — proxied locally. Jamendo adds full CC tracks; Strava token powers activity
          widgets; Spotify OAuth enables Now Playing.
        </p>

        <div className="space-y-4 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Search APIs
          </p>
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

          <p className="pt-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Live widgets
          </p>
          {INTEGRATION_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">{f.label}</label>
              <input
                type="password"
                value={integrations[f.key] ?? ''}
                onChange={(e) => setIntegrations((k) => ({ ...k, [f.key]: e.target.value }))}
                placeholder={f.hint}
                className="w-full rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-subtle)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <a
                href={f.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-[var(--accent-text)] hover:underline"
              >
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}

          <div className="rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-subtle)] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Music2 className="h-4 w-4 text-[#1db954]" />
              Spotify Now Playing
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
              Set <code className="text-[var(--accent-text)]">VITE_SPOTIFY_CLIENT_ID</code> in .env, add redirect{' '}
              <code className="break-all">/oauth/spotify/callback</code> in Spotify Dashboard.
            </p>
            <div className="mt-2 flex gap-2">
              {spotifyConfigured() ? (
                <>
                  <button
                    type="button"
                    className="btn-primary flex-1 py-1.5 text-xs"
                    onClick={() => {
                      try {
                        startSpotifyLogin()
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Spotify not configured')
                      }
                    }}
                  >
                    {spotifyLinked ? 'Reconnect' : 'Connect Spotify'}
                  </button>
                  {spotifyLinked && (
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--bg-muted)] px-3 py-1.5 text-xs"
                      onClick={() => {
                        clearSpotifyTokens()
                        setSpotifyLinked(false)
                        toast.success('Spotify disconnected')
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[10px] text-amber-600">Add VITE_SPOTIFY_CLIENT_ID to enable OAuth</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-subtle)] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Activity className="h-4 w-4 text-[#fc4c02]" />
              Strava
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
              Paste a personal access token above — no OAuth UI yet; covers your own activities.
            </p>
          </div>
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
