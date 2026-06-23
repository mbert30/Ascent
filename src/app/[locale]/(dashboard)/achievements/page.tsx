'use client'

import { useEffect, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { ArrowLeft, Trophy } from 'lucide-react'

import { AchievementCard } from '@/components/achievements/AchievementCard'
import { AchievementDetailSheet } from '@/components/achievements/AchievementDetailSheet'
import { useJuice } from '@/components/juice/useJuice'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { Progress } from '@/components/ui/progress'

import type { AchievementView } from '@/lib/achievements/service'

import type { ClaimCelebration } from '@/app/[locale]/(dashboard)/dashboard/components/ClaimRewardModal'
import { ClaimRewardModal } from '@/app/[locale]/(dashboard)/dashboard/components/ClaimRewardModal'

export default function AchievementsPage() {
  const t = useTranslations('achievements')
  const locale = useLocale()

  const [achievements, setAchievements] = useState<AchievementView[]>([])
  const [unlockedTiers, setUnlockedTiers] = useState(0)
  const [totalTiers, setTotalTiers] = useState(45)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AchievementView | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [claimCelebration, setClaimCelebration] =
    useState<ClaimCelebration>(null)
  const juice = useJuice()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/achievements')
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements ?? [])
        setUnlockedTiers(data.unlockedTiers ?? 0)
        setTotalTiers(data.totalTiers ?? 30)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openDetail = (a: AchievementView) => {
    setSelected(a)
    setSheetOpen(true)
  }

  const handleClaim = async (pendingId: string) => {
    juice.playUiClick()
    setClaimingId(pendingId)
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pendingId }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.gold > 0) {
        juice.playGoldGain(data.gold)
      }
      setClaimCelebration({
        gold: data.gold,
        xp: data.xp,
        type: data.type,
        refLevel: data.refLevel,
        refAchievementId: data.refAchievementId,
        refTier: data.refTier,
        achievementIcon: data.achievementIcon,
        achievementFrame: data.achievementFrame,
      })
      await load()
      if (selected) {
        const refreshed = (await fetch('/api/achievements').then((r) =>
          r.ok ? r.json() : null
        )) as { achievements?: AchievementView[] } | null
        const updated = refreshed?.achievements?.find(
          (a) => a.id === selected.id
        )
        if (updated) setSelected(updated)
      }
    } finally {
      setClaimingId(null)
    }
  }

  const globalPercent =
    totalTiers > 0 ? Math.round((unlockedTiers / totalTiers) * 100) : 0

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/${locale}/dashboard`}
          data-onboarding="achievements-back"
          className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <header className="space-y-4">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
            <Trophy className="h-8 w-8 text-amber-400" />
            {t('title')}
          </h1>
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/70">{t('globalProgress')}</span>
              <span className="font-bold text-amber-200">
                {t('tiersUnlocked', {
                  current: unlockedTiers,
                  total: totalTiers,
                })}
              </span>
            </div>
            <Progress value={globalPercent} className="h-3 bg-white/10" />
          </div>
        </header>

        {loading ? (
          <p className="text-center text-white/60">{t('loading')}</p>
        ) : (
          <div
            data-onboarding="achievements-grid"
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {achievements.map((a) => (
              <AchievementCard
                key={a.id}
                achievement={a}
                onClick={() => openDetail(a)}
              />
            ))}
          </div>
        )}
      </div>

      <AchievementDetailSheet
        achievement={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onClaim={handleClaim}
        claimingId={claimingId}
      />

      <ClaimRewardModal
        celebration={claimCelebration}
        onClose={() => setClaimCelebration(null)}
      />
    </DashboardShell>
  )
}
