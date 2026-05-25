type CommunityThemeJson = {
  id: string
  label: string
  description?: string
  workspaceBackground: string
  pageBackground: string
  defaultAccent: string
}

const SCHEMA = `Return ONLY valid JSON:
{"id":"slug","label":"Name","description":"...","category":"community","workspaceBackground":"css","pageBackground":"css","defaultAccent":"#hex"}`

export async function handleGenerateTheme(body: { prompt?: string }) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return { error: 'AI not configured — set OPENAI_API_KEY', status: 503 }

  const prompt = body.prompt?.trim() || 'minimal dark developer wall'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You design canvas themes. ${SCHEMA}` },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 500,
    }),
  })

  if (!res.ok) return { error: 'Theme generation failed', status: 502 }

  const data = await res.json()
  const text = (data.choices?.[0]?.message?.content as string) ?? ''
  try {
    const cleaned = text.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/, '')
    const theme = JSON.parse(cleaned) as CommunityThemeJson
    return { status: 200, data: { theme } }
  } catch {
    return { error: 'Invalid theme JSON from model', status: 502 }
  }
}
