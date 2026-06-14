'use client'

import { useTranslations } from 'next-intl'

import { motion } from 'framer-motion'
import { Coins, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AchievementFrame } from '@/lib/achievements/definitions'

import { AchievementIcon } from './AchievementIcon'

export type AchievementUnlockData = {
  achievementId: string
  nameKey: string
  icon: string
  frame: AchievementFrame
  tier: number
  gold: number
  xp: number
} | null

type AchievementUnlockModalProps = {
  data: AchievementUnlockData
  onClose: () => void
}

export function AchievementUnlockModal({
  data,
  onClose,
}: AchievementUnlockModalProps) {
  const t = useTranslations('achievements')

  return (
    <Dialog open={data != null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-purple-500/40 bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-fuchsia-600/25 text-white backdrop-blur-xl sm:max-w-sm">
        {data && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-col items-center gap-3 text-center">
                <span className="tier-unlock-pop">
                  <motion.div
                    initial={{ scale: 0.4, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  >
                    <AchievementIcon
                      icon={data.icon}
                      frame={data.frame}
                      size="lg"
                      pulse
                      progress={100}
                    />
                  </motion.div>
                </span>
                <span className="text-lg">{t('unlockTitle')}</span>
                <span className="text-2xl font-bold text-amber-200">
                  {t(data.nameKey)} — {t(`frames.${data.frame}`)}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <p className="text-sm text-white/80">{t('unlockSubtitle')}</p>
              <div className="flex gap-4">
                {data.gold > 0 && (
                  <p className="flex items-center gap-1.5 text-lg font-bold text-amber-200">
                    <Coins className="h-5 w-5" />+{data.gold}
                  </p>
                )}
                {data.xp > 0 && (
                  <p className="flex items-center gap-1.5 text-lg font-bold text-indigo-200">
                    <Sparkles className="h-5 w-5" />+{data.xp} XP
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={onClose}
                className="mt-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-95"
              >
                {t('unlockCta')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
