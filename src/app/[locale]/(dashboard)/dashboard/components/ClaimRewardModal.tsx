'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { motion } from 'framer-motion'
import { Coins, Sparkles, Trophy } from 'lucide-react'

import { AchievementIcon } from '@/components/achievements/AchievementIcon'
import { CountUpNumber } from '@/components/juice/CountUpNumber'
import { useJuiceOptional } from '@/components/juice/useJuice'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AchievementFrame } from '@/lib/achievements/definitions'
import type { PendingRewardType } from '@/lib/pending-rewards'

export type ClaimCelebration = {
  gold: number
  xp: number
  type: PendingRewardType
  refLevel: number | null
  refAchievementId?: string | null
  refTier?: number | null
  achievementIcon?: string | null
  achievementFrame?: AchievementFrame | null
} | null

type ClaimRewardModalProps = {
  celebration: ClaimCelebration
  onClose: () => void
}

export function ClaimRewardModal({
  celebration,
  onClose,
}: ClaimRewardModalProps) {
  const t = useTranslations('dashboard.overview.missions')
  const tAch = useTranslations('achievements')
  const juice = useJuiceOptional()
  const playedRef = useRef<string | null>(null)
  const open = celebration != null

  const isAchievement = celebration?.type === 'ACHIEVEMENT'

  useEffect(() => {
    if (!open || !celebration || !juice) return
    const key = `${celebration.type}-${celebration.refLevel}-${celebration.refTier}`
    if (playedRef.current === key) return
    playedRef.current = key
    juice.playRewardClaimed(celebration.type)
  }, [open, celebration, juice])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-600/25 text-white backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3 text-center text-xl">
            {isAchievement && celebration?.achievementIcon ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
              >
                <AchievementIcon
                  icon={celebration.achievementIcon}
                  frame={celebration.achievementFrame ?? 'gold'}
                  size="lg"
                  progress={100}
                  pulse
                />
              </motion.div>
            ) : (
              <motion.span
                className="reward-pop-badge flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/40"
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.span>
            )}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {isAchievement
                ? tAch('claimTitle', { tier: celebration?.refTier ?? 1 })
                : celebration?.type === 'LEVEL_UP'
                  ? t('claimLevelTitle', {
                      level: celebration.refLevel ?? '',
                    })
                  : t('claimCelebrationTitle')}
            </motion.span>
          </DialogTitle>
        </DialogHeader>
        {celebration && (
          <motion.div
            className="flex flex-col items-center gap-3 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, staggerChildren: 0.08 }}
          >
            {celebration.gold > 0 && (
              <motion.p
                className="flex items-center gap-2 text-2xl font-bold text-amber-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Coins className="h-6 w-6" />
                <CountUpNumber
                  value={celebration.gold}
                  formatter={(n) => t('claimGold', { gold: Math.round(n) })}
                />
              </motion.p>
            )}
            {celebration.xp > 0 && (
              <motion.p
                className="flex items-center gap-2 text-lg font-semibold text-indigo-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <Sparkles className="h-5 w-5" />
                <CountUpNumber
                  value={celebration.xp}
                  formatter={(n) => t('claimXp', { xp: Math.round(n) })}
                />
              </motion.p>
            )}
            <Button
              type="button"
              onClick={onClose}
              className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
            >
              {t('claimCta')}
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
