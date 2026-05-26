/**
 * Floating emoji bursts when visitors react on public walls.
 *
 * Each click spawns:
 *  - 1 large HERO particle that pops in the center of the screen and fades
 *  - 10–14 smaller TRAIL particles that launch upward from the click point
 *    with arc/drift/rotation for a satisfying confetti feel.
 */
import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Burst = {
  id: string
  emoji: string
  x: number
  y: number
  drift: number
  rise: number
  rot: number
  size: number
  hero?: boolean
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function useReactionBursts() {
  const [bursts, setBursts] = useState<Burst[]>([])

  const spawnBurst = useCallback((emoji: string, origin?: { x: number; y: number }) => {
    const cx = origin?.x ?? window.innerWidth * randomBetween(0.35, 0.65)
    const cy = origin?.y ?? window.innerHeight * randomBetween(0.55, 0.75)

    // Hero pops in the middle of the screen — the satisfying "BIG" reaction.
    const hero: Burst = {
      id: `${Date.now()}-h-${Math.random()}`,
      emoji,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      drift: 0,
      rise: 0,
      rot: 0,
      size: 1,
      hero: true,
    }

    // Trail particles from the click origin shooting upward in a spread.
    const count = 10 + Math.floor(Math.random() * 5)
    const trail: Burst[] = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      emoji,
      x: cx + randomBetween(-50, 50),
      y: cy + randomBetween(-20, 20),
      drift: randomBetween(-180, 180),
      rise: randomBetween(-260, -480),
      rot: randomBetween(-60, 60),
      size: randomBetween(0.85, 1.4),
    }))

    const next = [hero, ...trail]
    setBursts((prev) => [...prev, ...next])
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => !next.some((n) => n.id === b.id)))
    }, 2400)
  }, [])

  return { bursts, spawnBurst }
}

export function ReactionBurstLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <motion.div className="reaction-burst-layer" aria-hidden initial={false}>
      <AnimatePresence>
        {bursts.map((b) =>
          b.hero ? (
            <motion.span
              key={b.id}
              className="reaction-burst-hero"
              style={{ left: b.x, top: b.y }}
              initial={{ opacity: 0, scale: 0.2, rotate: -8 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, 2.4, 2.1, 1.6],
                rotate: [-8, 6, -4, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.4, times: [0, 0.25, 0.6, 1], ease: [0.22, 1, 0.36, 1] }}
            >
              {b.emoji}
            </motion.span>
          ) : (
            <motion.span
              key={b.id}
              className="reaction-burst-particle"
              style={{ left: b.x, top: b.y }}
              initial={{ opacity: 0, scale: 0.3, y: 0, x: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, b.size * 1.2, b.size, b.size * 0.7],
                y: b.rise,
                x: b.drift,
                rotate: b.rot,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
            >
              {b.emoji}
            </motion.span>
          ),
        )}
      </AnimatePresence>
    </motion.div>
  )
}
