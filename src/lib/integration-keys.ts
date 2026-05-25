/** OAuth tokens & integration keys (browser localStorage only). */

const STORAGE_KEY = 'wall_integration_keys_v1'

export type IntegrationKeys = {
  jamendo?: string
  strava?: string
}

export function loadIntegrationKeys(): IntegrationKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as IntegrationKeys) : {}
  } catch {
    return {}
  }
}

export function mergeIntegrationKeys(patch: Partial<IntegrationKeys>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadIntegrationKeys(), ...patch }))
}

export function getIntegrationKey(name: keyof IntegrationKeys): string | undefined {
  const stored = loadIntegrationKeys()[name]?.trim()
  if (stored) return stored
  const envMap: Record<keyof IntegrationKeys, string | undefined> = {
    jamendo: import.meta.env.VITE_JAMENDO_CLIENT_ID,
    strava: import.meta.env.VITE_STRAVA_ACCESS_TOKEN,
  }
  return envMap[name]?.trim() || undefined
}

export function hasIntegrationKey(name: keyof IntegrationKeys): boolean {
  return Boolean(getIntegrationKey(name))
}
