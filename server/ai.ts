/** OpenAI tool schemas for the wall canvas agent (mirrors src/lib/wall-agent-tools.ts) */
export const WALL_AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'add_sticky',
      description: 'Add a sticky note to the wall canvas',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          color: { type: 'string', enum: ['yellow', 'light-green', 'light-blue', 'light-violet', 'light-red', 'orange'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_text',
      description: 'Add a large text heading block',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          size: { type: 'string', enum: ['s', 'm', 'l', 'xl'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_link',
      description: 'Add a link card or embed',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_emoji',
      description: 'Add a large emoji sticker',
      parameters: {
        type: 'object',
        properties: { emoji: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['emoji'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_qr',
      description: 'Generate a QR code for a URL',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_widget',
      description: 'Add a live widget',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['clock', 'weather', 'spotify', 'github'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_theme',
      description: 'Change wall background theme',
      parameters: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: ['corkboard', 'whiteboard', 'glass', 'fridge', 'locker', 'notebook', 'black', 'white'],
          },
        },
        required: ['theme'],
      },
    },
  },
  {
    type: 'function',
    function: { name: 'fit_wall', description: 'Zoom to fit entire wall', parameters: { type: 'object', properties: {} } },
  },
  {
    type: 'function',
    function: { name: 'delete_selected', description: 'Delete selected shapes', parameters: { type: 'object', properties: {} } },
  },
]

const SYSTEM_PROMPT = `You are Wall Agent — an AI assistant that edits a personal noticeboard canvas (1600×1000px).
You can add stickies, text, links, emojis, QR codes, widgets, change themes, and arrange content.
Use tools to make changes the user asks for. Spread elements across the canvas (avoid stacking at 0,0).
Use x/y coordinates thoughtfully: top-left area ~100-400, center ~600-900, bottom ~700-900 y.
After using tools, give a brief friendly summary of what you did.
Only edit the canvas when the user asks — don't add things unprompted.`

type ChatMessage = Record<string, unknown>

export async function handleAiChat(body: {
  messages?: ChatMessage[]
  canvasSummary?: string
}) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return { error: 'AI not configured — set OPENAI_API_KEY on the server', status: 503 }

  const userMessages = body.messages ?? []
  const canvasSummary = body.canvasSummary ?? 'Unknown canvas state'

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `Current canvas state:\n${canvasSummary}`,
    },
    ...userMessages,
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages,
      tools: WALL_AGENT_TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('OpenAI error:', err)
    return { error: 'AI request failed', status: 502 }
  }

  const data = await res.json()
  const choice = data.choices?.[0]?.message
  if (!choice) return { error: 'Empty AI response', status: 502 }

  const toolCalls = choice.tool_calls?.map(
    (tc: { id: string; function: { name: string; arguments: string } }) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || '{}'),
    }),
  )

  return {
    status: 200,
    data: {
      message: choice.content ?? '',
      toolCalls: toolCalls ?? [],
      assistantMessage: choice,
    },
  }
}
