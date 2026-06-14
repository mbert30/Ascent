'use client'

import { useTranslations } from 'next-intl'

import { Check, Coins, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import { tierRowClass } from '@/lib/achievements/frames'
import type { AchievementView } from '@/lib/achievements/service'
import { cn } from '@/lib/utils'

import { AchievementIcon } from './AchievementIcon'

type AchievementDetailSheetProps = {
  achievement: AchievementView | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onClaim: (pendingId: string) => void
  claimingId: string | null
}

export function AchievementDetailSheet({
  achievement,
  open,
  onOpenChange,
  onClaim,
  claimingId,
}: AchievementDetailSheetProps) {
  const t = useTranslations('achievements')

  if (!achievement) return null

  const currentFrame =
    achievement.tiers.find((tier) => tier.tier === achievement.currentTier)
      ?.frame ?? null
  const pendingTier = achievement.tiers.find((tier) => tier.pendingId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/20 bg-slate-900/98 text-white backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t(achievement.nameKey)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <AchievementIcon
            icon={achievement.icon}
            frame={achievement.currentTier > 0 ? currentFrame : null}
            size="lg"
            locked={achievement.currentTier === 0}
            progress={achievement.percentToNext}
            pulse={!!pendingTier}
          />
          <p className="text-center text-sm text-white/70">
            {t(achievement.descriptionKey)}
          </p>
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs text-white/60">
              <span>{t('progress', { value: achievement.progress })}</span>
              {achievement.nextThreshold != null && (
                <span>
                  {t('nextAt', { threshold: achievement.nextThreshold })}
                </span>
              )}
            </div>
            <Progress
              value={achievement.percentToNext}
              className="h-2.5 bg-white/10"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">
            {t('tiersTitle')}
          </p>
          {[...achievement.tiers].reverse().map((tier) => (
            <div
              key={tier.tier}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-3',
                tierRowClass(tier.frame, tier.unlocked)
              )}
            >
              <AchievementIcon
                icon={tier.icon}
                frame={tier.unlocked ? tier.frame : null}
                size="sm"
                locked={!tier.unlocked}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {t(`frames.${tier.frame}`)} —{' '}
                  {t('tierLabel', { tier: tier.tier })}
                </p>
                <p className="text-xs text-white/60">
                  {t('threshold', { count: tier.threshold })}
                </p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs text-amber-200/90">
                  {tier.gold > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Coins className="h-3 w-3" />+{tier.gold}
                    </span>
                  )}
                  {tier.xp > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3" />+{tier.xp} XP
                    </span>
                  )}
                </p>
              </div>
              {tier.claimed ? (
                <Check className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : tier.pendingId ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={claimingId === tier.pendingId}
                  onClick={() => onClaim(tier.pendingId!)}
                  className="shrink-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
                >
                  {t('claim')}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
