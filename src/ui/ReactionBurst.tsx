/**
 * Floating emoji bursts when visitors react on public walls.
 */
import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Burst = { id: string; emoji: string; x: number; y: number; drift: number }

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function useReactionBursts() {
  const [bursts, setBursts] = useState<Burst[]>([])

  const spawnBurst = useCallback((emoji: string, origin?: { x: number; y: number }) => {
    const count = 5 + Math.floor(Math.random() * 4)
    const cx = origin?.x ?? window.innerWidth * randomBetween(0.35, 0.65)
    const cy = origin?.y ?? window.innerHeight * randomBetween(0.55, 0.75)

    const next: Burst[] = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      emoji,
      x: cx + randomBetween(-40, 40),
      y: cy + randomBetween(-20, 20),
      drift: randomBetween(-80, 80),
    }))

    setBursts((prev) => [...prev, ...next])
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => !next.some((n) => n.id === b.id)))
    }, 2200)
  }, [])

  return { bursts, spawnBurst }
}

export function ReactionBurstLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <motion.div
      className="reaction-burst-layer"
      aria-hidden
      initial={false}
    >
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="reaction-burst-particle"
            style={{ left: b.x, top: b.y }}
            initial={{ opacity: 0, scale: 0.2, y: 0, x: 0, rotate: -12 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.2, 1.2, 1, 0.6],
              y: randomBetween(-180, -320),
              x: b.drift,
              rotate: randomBetween(-25, 25),
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
