import type { CanvasElement } from '@/types/canvas'
import { cn } from '@/lib/cn'

type Props = {
  element: CanvasElement
  selected?: boolean
}

export function CodeCardElement({ element, selected }: Props) {
  const data = element.content as { code?: string; language?: string }
  const code = data.code ?? ''
  const lang = data.language ?? 'code'

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] font-mono text-xs text-[#d4d4d4] shadow-xl',
        selected && 'ring-2 ring-[#beee1d]/50',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#252526] px-3 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#beee1d]">{lang}</span>
        <span className="text-[9px] text-neutral-500">Paste · code</span>
      </div>
      <pre className="flex-1 overflow-auto p-3 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
