/**
 * Creative canvas agent — login-gated, BYO key, editor-only right drawer.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send, Loader2, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { getCanvasSummary } from '@/editor/canvas-summary'
import { executeAgentToolCalls, type ChatMessage } from '@/lib/wall-agent'
import { chatWithAgent } from '@/lib/ai-client'
import { isAiConfigured, loadAiConfig } from '@/lib/ai-config'
import { AiSettingsModal } from '@/ui/AiSettingsModal'
import { cn } from '@/lib/cn'

type UiMessage = { role: 'user' | 'assistant'; text: string }

const MAX_TOOL_ROUNDS = 8

const PRESET_PROMPTS = [
  'Build a developer portfolio wall with intro sticky, GitHub widget, and Spotify player',
  'Create a mood board with 4 colorful stickies about travel and photography',
  'Add a link-in-bio layout with my social links and a QR code',
]

export function AiAgentPanel() {
  const user = useAuthStore((s) => s.user)
  const open = useUiStore((s) => s.showAiPanel)
  const setOpen = useUiStore((s) => s.setShowAiPanel)
  const setShowAiSettings = useUiStore((s) => s.setShowAiSettings)
  const showAiSettings = useUiStore((s) => s.showAiSettings)

  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: 'assistant',
      text: "I'm your creative canvas agent. I can build full layouts, add links, music widgets, images, stickies, and more. What should we create?",
    },
  ])
  const chatHistory = useRef<ChatMessage[]>([])

  useEffect(() => {
    if (open && user && !isAiConfigured()) {
      setOnboarding(true)
    }
  }, [open, user])

  const openPanel = () => {
    if (!isAiConfigured()) setOnboarding(true)
    setOpen(true)
  }

  const runAgentLoop = useCallback(async (userText: string) => {
    const config = loadAiConfig()
    if (!config?.apiKey) throw new Error('Configure your API key in AI settings first.')

    chatHistory.current.push({ role: 'user', content: userText })

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const res = await chatWithAgent(config, chatHistory.current, getCanvasSummary())

      if (res.toolCalls.length) {
        chatHistory.current.push(res.assistantMessage)

        const results = await executeAgentToolCalls(res.toolCalls)
        for (const r of results) {
          chatHistory.current.push({ role: 'tool', tool_call_id: r.id, content: r.result })
        }
        continue
      }

      const reply = res.message || 'Done!'
      chatHistory.current.push({ role: 'assistant', content: reply })
      return reply
    }

    return 'I made several changes to your wall. Want anything else?'
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    if (!isAiConfigured()) {
      setOnboarding(true)
      return
    }
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setBusy(true)
    try {
      const reply = await runAgentLoop(text)
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: e instanceof Error ? e.message : 'Something went wrong.' },
      ])
    } finally {
      setBusy(false)
    }
  }

  if (!user) return null

  const config = loadAiConfig()

  return (
    <>
      {!open && (
        <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-40 sm:right-6">
          <button
            type="button"
            onClick={openPanel}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#beee1d] text-black shadow-lg transition hover:scale-105 active:scale-95"
            title="Creative AI Agent"
          >
            <Sparkles className="h-6 w-6" />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#beee1d]" />
              <div>
                <h3 className="text-sm font-black text-[#beee1d]">Creative Agent</h3>
                <p className="text-[10px] text-neutral-500">
                  @{user.username}
                  {config ? ` · ${config.provider}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="AI settings"
                onClick={() => setShowAiSettings(true)}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isAiConfigured() && (
            <div className="border-b border-amber-900/30 bg-amber-950/30 px-5 py-3">
              <p className="text-xs text-amber-200">
                Connect your API key to start.{' '}
                <button type="button" onClick={() => setOnboarding(true)} className="font-bold text-[#beee1d] underline">
                  Set up now
                </button>
              </p>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[92%] rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                  m.role === 'user' ? 'ml-auto bg-[#beee1d]/15 text-white' : 'bg-neutral-900 text-neutral-300',
                )}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Editing your canvas…
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800 px-5 py-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">Try a preset</p>
            <div className="mb-3 flex flex-col gap-1.5">
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setInput(p)}
                  className="rounded-lg border border-neutral-800 px-3 py-2 text-left text-[11px] text-neutral-400 transition hover:border-neutral-700 hover:bg-white/5 hover:text-neutral-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#beee1d]/10 bg-black/40 p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="e.g. Build a stunning project board with 4 yellow stickies…"
              disabled={busy}
              rows={3}
              className="flex-1 resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:ring-2 focus:ring-[#beee1d]/30"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || !input.trim()}
              className="flex h-10 w-10 shrink-0 self-end items-center justify-center rounded-xl bg-[#beee1d] text-black disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {(onboarding || showAiSettings) && (
        <AiSettingsModal
          onboarding={onboarding && !showAiSettings}
          onConfigured={() => {
            setOnboarding(false)
            setShowAiSettings(false)
            setOpen(true)
          }}
        />
      )}
    </>
  )
}
