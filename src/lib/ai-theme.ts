import type { CommunityThemeJson } from '@/themes/community-theme'
import type { AiConfig } from '@/lib/ai-config'

const THEME_SCHEMA_HINT = `Return ONLY valid JSON matching this shape (no markdown):
{
  "id": "kebab-case-slug",
  "label": "Human Name",
  "description": "one line",
  "category": "community",
  "workspaceBackground": "CSS background for area around canvas",
  "pageBackground": "CSS background for 1600x1000 page",
  "pageBackgroundSize": "optional",
  "defaultAccent": "#hex",
  "canvasClass": "optional tailwind-ish tokens"
}`

export async function generateThemeWithAi(
  prompt: string,
  config: AiConfig,
): Promise<CommunityThemeJson> {
  const body = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: `You are a wall canvas theme designer. ${THEME_SCHEMA_HINT}`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 600,
  }

  if (config.provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('OpenAI theme generation failed')
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content as string
    return parseThemeJson(text)
  }

  throw new Error(`Theme generation not implemented for ${config.provider}`)
}

function parseThemeJson(raw: string): CommunityThemeJson {
  const trimmed = raw.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/, '')
  const parsed = JSON.parse(trimmed) as CommunityThemeJson
  if (!parsed.id || !parsed.workspaceBackground || !parsed.pageBackground) {
    throw new Error('Invalid theme JSON from AI')
  }
  return parsed
}
