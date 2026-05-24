/**
 * BYO-key AI client — OpenAI, Anthropic, Gemini with shared tool-calling loop.
 */
import type { AiConfig } from '@/lib/ai-config'
import { WALL_AGENT_TOOL_SCHEMAS } from '@/lib/wall-agent-tools'
import type { AgentToolCall } from '@/lib/wall-agent-tools'
import type { ChatMessage } from '@/lib/wall-agent'

const SYSTEM_PROMPT = `You are Wall Creative Agent — an expert noticeboard designer that edits a 1600×1000px living canvas.

You can create complete layouts from scratch, edit existing content, add stickies, headings, links, embeds, emojis, QR codes, widgets (clock, weather, spotify, github), images from URLs, GIFs, and change themes.

Capabilities:
- Build portfolio walls, mood boards, link-in-bio pages, and project dashboards
- Place elements with intentional x/y coordinates (spread across the canvas)
- Use auto_arrange after adding many items for a clean grid
- Set wall title and theme to match the vibe
- Add Spotify/YouTube links as rich embeds

Coordinate guide: x 80–1400, y 80–900. Stagger positions — never stack everything at (0,0).
Use multiple tool calls in one turn when building layouts. After changes, summarize briefly what you built.`

export type AiChatResult = {
  message: string
  toolCalls: AgentToolCall[]
  assistantMessage: ChatMessage
}

function openAiTools() {
  return WALL_AGENT_TOOL_SCHEMAS
}

function anthropicTools() {
  return WALL_AGENT_TOOL_SCHEMAS.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters,
  }))
}

function geminiTools() {
  return [
    {
      functionDeclarations: WALL_AGENT_TOOL_SCHEMAS.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
      })),
    },
  ]
}

function parseOpenAiResponse(choice: Record<string, unknown>): AiChatResult {
  const toolCallsRaw = choice.tool_calls as Array<{
    id: string
    function: { name: string; arguments: string }
  }> | undefined

  const toolCalls: AgentToolCall[] =
    toolCallsRaw?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>,
    })) ?? []

  return {
    message: (choice.content as string) ?? '',
    toolCalls,
    assistantMessage: choice as ChatMessage,
  }
}

async function chatOpenAi(
  config: AiConfig,
  messages: ChatMessage[],
  canvasSummary: string,
): Promise<AiChatResult> {
  const payload = {
    model: config.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Current canvas:\n${canvasSummary}` },
      ...messages,
    ],
    tools: openAiTools(),
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 2048,
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const choice = data.choices?.[0]?.message
  if (!choice) throw new Error('Empty OpenAI response')
  return parseOpenAiResponse(choice)
}

async function chatAnthropic(
  config: AiConfig,
  messages: ChatMessage[],
  canvasSummary: string,
): Promise<AiChatResult> {
  const anthropicMessages: Array<Record<string, unknown>> = []

  for (const m of messages) {
    if (m.role === 'user') {
      anthropicMessages.push({ role: 'user', content: m.content })
    } else if (m.role === 'assistant') {
      if ('tool_calls' in m && m.tool_calls?.length) {
        anthropicMessages.push({
          role: 'assistant',
          content: m.tool_calls.map((tc) => ({
            type: 'tool_use',
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments || '{}'),
          })),
        })
      } else if (m.content) {
        anthropicMessages.push({ role: 'assistant', content: m.content })
      }
    } else if (m.role === 'tool') {
      anthropicMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: m.tool_call_id,
            content: m.content,
          },
        ],
      })
    }
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      system: `${SYSTEM_PROMPT}\n\nCurrent canvas:\n${canvasSummary}`,
      tools: anthropicTools(),
      messages: anthropicMessages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.content as Array<Record<string, unknown>>
  const toolCalls: AgentToolCall[] = []
  let text = ''

  for (const block of content ?? []) {
    if (block.type === 'text') text += block.text
    if (block.type === 'tool_use') {
      toolCalls.push({
        id: String(block.id),
        name: String(block.name),
        arguments: (block.input as Record<string, unknown>) ?? {},
      })
    }
  }

  const assistantMessage: ChatMessage = toolCalls.length
    ? {
        role: 'assistant',
        content: text || null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
        })),
      }
    : { role: 'assistant', content: text }

  return { message: text, toolCalls, assistantMessage }
}

async function chatGemini(
  config: AiConfig,
  messages: ChatMessage[],
  canvasSummary: string,
): Promise<AiChatResult> {
  const contents: Array<Record<string, unknown>> = []

  for (const m of messages) {
    if (m.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: m.content }] })
    } else if (m.role === 'assistant') {
      if ('tool_calls' in m && m.tool_calls?.length) {
        contents.push({
          role: 'model',
          parts: m.tool_calls.map((tc) => ({
            functionCall: {
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments || '{}'),
            },
          })),
        })
      } else if (m.content) {
        contents.push({ role: 'model', parts: [{ text: m.content }] })
      }
    } else if (m.role === 'tool') {
      contents.push({
        role: 'function',
        parts: [
          {
            functionResponse: {
              name: 'tool_result',
              response: { result: m.content },
            },
          },
        ],
      })
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCurrent canvas:\n${canvasSummary}` }] },
      contents,
      tools: geminiTools(),
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts as Array<Record<string, unknown>> | undefined
  const toolCalls: AgentToolCall[] = []
  let text = ''

  for (const part of parts ?? []) {
    if (part.text) text += part.text
    const fc = part.functionCall as { name: string; args: Record<string, unknown> } | undefined
    if (fc) {
      toolCalls.push({
        id: `gemini-${Date.now()}-${toolCalls.length}`,
        name: fc.name,
        arguments: fc.args ?? {},
      })
    }
  }

  const assistantMessage: ChatMessage = toolCalls.length
    ? {
        role: 'assistant',
        content: text || null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
        })),
      }
    : { role: 'assistant', content: text }

  return { message: text, toolCalls, assistantMessage }
}

export async function chatWithAgent(
  config: AiConfig,
  messages: ChatMessage[],
  canvasSummary: string,
): Promise<AiChatResult> {
  switch (config.provider) {
    case 'openai':
      return chatOpenAi(config, messages, canvasSummary)
    case 'anthropic':
      return chatAnthropic(config, messages, canvasSummary)
    case 'google':
      return chatGemini(config, messages, canvasSummary)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
