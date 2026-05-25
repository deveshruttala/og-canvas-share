import { useCanvasStore } from '@/store/canvas.store'
import { cn } from '@/lib/cn'

type PollOption = { id: string; emoji: string; label?: string }

type Props = {
  pollId: string
  question: string
  options: PollOption[]
  readOnly?: boolean
  selected?: boolean
}

function voteKey(pollId: string, optionId: string) {
  return `poll:${pollId}:${optionId}`
}

export function PollElement({ pollId, question, options, readOnly, selected }: Props) {
  const reactions = useCanvasStore((s) => s.doc.reactions)
  const incrementReaction = useCanvasStore((s) => s.incrementReaction)
  const wallId = useCanvasStore((s) => s.doc.id)

  const storageKey = `wall_poll_voted_${wallId}_${pollId}`

  const handleVote = (optionId: string) => {
    if (readOnly) return
    if (sessionStorage.getItem(storageKey)) return
    incrementReaction(voteKey(pollId, optionId))
    sessionStorage.setItem(storageKey, optionId)
  }

  const voted = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(storageKey) : null

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col rounded-2xl border border-white/10 bg-[#12141a] p-4 text-white',
        selected && 'ring-2 ring-[#beee1d]/50',
      )}
    >
      <p className="text-sm font-bold text-[#beee1d]">{question}</p>
      <p className="mt-0.5 text-[9px] text-neutral-500">
        {voted ? 'Thanks for voting' : 'Pick one · one vote per visit'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const count = reactions[voteKey(pollId, opt.id)] ?? 0
          const isVoted = voted === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={Boolean(voted) || readOnly}
              onClick={(e) => {
                e.stopPropagation()
                handleVote(opt.id)
              }}
              className={cn(
                'flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2 transition',
                isVoted
                  ? 'border-[#beee1d] bg-[#beee1d]/15'
                  : 'border-white/10 bg-white/5 hover:border-white/25',
                (voted && !isVoted) && 'opacity-40',
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              {opt.label && <span className="mt-1 text-[9px] font-semibold">{opt.label}</span>}
              <span className="mt-1 text-[10px] font-black text-neutral-400">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
