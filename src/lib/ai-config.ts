/** BYO AI key + provider config (stored locally in the browser). */

export type AiProvider = 'openai' | 'anthropic' | 'google'

export type AiConfig = {
  provider: AiProvider
  model: string
  apiKey: string
  configuredAt?: string
}

const STORAGE_KEY = 'wall_ai_config_v1'

export const AI_PROVIDER_OPTIONS: Record<
  AiProvider,
  { label: string; models: { id: string; label: string }[]; keyHint: string; docsUrl: string }
> = {
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (fast)' },
      { id: 'gpt-4o', label: 'GPT-4o (best)' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    ],
    keyHint: 'sk-…',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label: 'Anthropic Claude',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (fast)' },
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    ],
    keyHint: 'sk-ant-…',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  google: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash' },
    ],
    keyHint: 'AI…',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
}

export function loadAiConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AiConfig
    if (!parsed.apiKey?.trim()) return null
    return parsed
  } catch {
    return null
  }
}

export function saveAiConfig(config: AiConfig) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...config, configuredAt: new Date().toISOString() }),
  )
}

export function clearAiConfig() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAiConfigured(): boolean {
  return Boolean(loadAiConfig()?.apiKey?.trim())
}

export function defaultModelFor(provider: AiProvider): string {
  return AI_PROVIDER_OPTIONS[provider].models[0].id
}
