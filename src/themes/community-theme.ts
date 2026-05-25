/** Community themes shipped as JSON under /public/themes/ (PR-friendly, no marketplace UI). */

export type CommunityThemeJson = {
  id: string
  label: string
  description?: string
  category?: string
  workspaceBackground: string
  pageBackground: string
  pageBackgroundSize?: string
  pageBackgroundPosition?: string
  pageBackgroundRepeat?: string
  defaultAccent: string
  workspaceClass?: string
  canvasClass?: string
}

export type CommunityThemeManifest = {
  themes: Array<{ id: string; file: string; label: string; description?: string }>
}

let cache: CommunityThemeJson[] | null = null

export async function loadCommunityThemes(): Promise<CommunityThemeJson[]> {
  if (cache) return cache
  try {
    const manifestRes = await fetch('/themes/manifest.json')
    if (!manifestRes.ok) return []
    const manifest = (await manifestRes.json()) as CommunityThemeManifest
    const loaded = await Promise.all(
      manifest.themes.map(async (entry) => {
        const res = await fetch(`/themes/${entry.file}`)
        if (!res.ok) return null
        return (await res.json()) as CommunityThemeJson
      }),
    )
    cache = loaded.filter((t): t is CommunityThemeJson => Boolean(t?.id))
    return cache
  } catch {
    return []
  }
}

export function clearCommunityThemeCache() {
  cache = null
}
