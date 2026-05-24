import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { buildEmbedSnippets } from '@/lib/embed-snippets'
import type { ShareSubject } from '@/lib/share-urls'
import { cn } from '@/lib/cn'

export function ShareEmbedPanel({ subject }: { subject: ShareSubject }) {
  const [copied, setCopied] = useState<string | null>(null)
  const snippets = buildEmbedSnippets(subject)

  const copy = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(id)
    toast.success('Copied')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
      {snippets.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black text-white">{s.platform}</p>
              <p className="text-[10px] text-neutral-500">{s.label}</p>
            </div>
            <button
              type="button"
              onClick={() => void copy(s.id, s.code)}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold',
                copied === s.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white',
              )}
            >
              {copied === s.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied === s.id ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-[#0a0a0f] p-2 text-[10px] leading-relaxed text-neutral-400">
            {s.code}
          </pre>
        </div>
      ))}
    </div>
  )
}
