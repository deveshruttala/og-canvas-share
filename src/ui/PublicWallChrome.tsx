import { Link } from 'react-router-dom'
import { useCanvasStore } from '@/store/canvas.store'
import { ReactionBurstLayer, useReactionBursts } from '@/ui/ReactionBurst'
import { isApiConfigured } from '@/lib/api'
import { recordPing } from '@/lib/stats-client'

const REACTIONS = ['❤️', '🔥', '👏', '💡', '🎉', '🤯', '😂', '🚀', '⭐', '👍', '😮', '💯'] as const

/** Compact corner reactions for public wall view */
export function ReactionBar({ username }: { username?: string }) {
  const reactions = useCanvasStore((s) => s.doc.reactions)
  const incrementReaction = useCanvasStore((s) => s.incrementReaction)
  const { bursts, spawnBurst } = useReactionBursts()

  return (
    <>
      <ReactionBurstLayer bursts={bursts} />
      <div className="public-reactions" role="toolbar" aria-label="Reactions">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="public-reaction-btn"
            title={`React ${emoji}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              incrementReaction(emoji)
              spawnBurst(emoji, {
                x: rect.left + rect.width / 2,
                y: rect.top,
              })
              if (username && isApiConfigured()) {
                void fetch(`${import.meta.env.VITE_API_URL}/u/${username}/react`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ emoji }),
                })
                void recordPing({ kind: 'wall', id: username }, 'reaction', { emoji })
              }
            }}
          >
            <span className="public-reaction-emoji">{emoji}</span>
            {(reactions[emoji] ?? 0) > 0 && (
              <span className="public-reaction-count">{reactions[emoji]}</span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}

/** Logo + reactions pinned to bottom-left on public walls */
export function PublicWallChrome({ username }: { username?: string }) {
  return (
    <div className="public-wall-chrome">
      <Link to="/" className="public-wall-logo" aria-label="Wall home">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" aria-hidden />
        <span>Wall</span>
      </Link>
      <ReactionBar username={username} />
    </div>
  )
}
