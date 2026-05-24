/** Provider API keys — browser localStorage only, never sent to our backend. */

const STORAGE_KEY = 'wall_provider_keys_v1'

export type ProviderKeys = {
  unsplash?: string
  pexels?: string
  giphy?: string
  tenor?: string
  freesound?: string
}

export function loadProviderKeys(): ProviderKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProviderKeys) : {}
  } catch {
    return {}
  }
}

export function saveProviderKeys(keys: ProviderKeys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function mergeProviderKeys(patch: Partial<ProviderKeys>) {
  saveProviderKeys({ ...loadProviderKeys(), ...patch })
}

export function hasKey(name: keyof ProviderKeys): boolean {
  return Boolean(loadProviderKeys()[name]?.trim())
}

/** Env fallbacks for dev */
export function getProviderKey(name: keyof ProviderKeys): string | undefined {
  const stored = loadProviderKeys()[name]?.trim()
  if (stored) return stored
  const envMap: Record<keyof ProviderKeys, string | undefined> = {
    unsplash: import.meta.env.VITE_UNSPLASH_KEY,
    pexels: import.meta.env.VITE_PEXELS_KEY,
    giphy: import.meta.env.VITE_GIPHY_API_KEY,
    tenor: import.meta.env.VITE_TENOR_KEY,
    freesound: import.meta.env.VITE_FREESOUND_TOKEN,
  }
  return envMap[name]?.trim() || undefined
}
