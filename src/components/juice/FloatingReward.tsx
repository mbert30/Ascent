'use client'

import { useEffect } from 'react'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import type { FloatingRewardPayload } from '@/lib/juice/types'

type FloatingRewardProps = {
  reward: FloatingRewardPayload
  targetX: number
  targetY: number
  onDone: (id: string) => void
  reducedMotion?: boolean
}

export function FloatingReward({
  reward,
  targetX,
  targetY,
  onDone,
  reducedMotion = false,
}: FloatingRewardProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(reward.id), reducedMotion ? 400 : 900)
    return () => clearTimeout(timer)
  }, [reward.id, onDone, reducedMotion])

  if (reducedMotion) {
    return null
  }

  return (
    <motion.div
      className="pointer-events-none fixed z-[80] font-bold whitespace-nowrap"
      style={{ left: reward.originX, top: reward.originY }}
      initial={{ opacity: 1, scale: 0.6, x: '-50%', y: '-50%' }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0.6, 1.1, 0.8],
        x: ['-50%', `${targetX - reward.originX}px`],
        y: ['-50%', `${targetY - reward.originY}px`],
      }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
    >
      <span
        className={
          reward.kind === 'xp'
            ? 'flex items-center gap-1 rounded-full bg-indigo-500/90 px-3 py-1 text-sm text-white shadow-lg shadow-indigo-500/40'
            : 'flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-sm text-slate-900 shadow-lg'
        }
      >
        {reward.kind === 'xp' && <Sparkles className="h-3.5 w-3.5" />}
        {reward.label}
      </span>
    </motion.div>
  )
}
