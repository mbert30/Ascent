import type { PrismaClient } from '@prisma/client'

import { DEFAULT_THEME_ID } from '@/lib/themes/definitions'
import { ensureDefaultTheme } from '@/lib/themes/service'

const RESET_CONFIRM_PHRASES = new Set(['RESET', 'REINITIALISER'])

function normalizeConfirmationPhrase(phrase: string): string {
  return phrase.trim().toUpperCase().normalize('NFD').replace(/\p{M}/gu, '')
}

export function isValidResetConfirmation(phrase: string): boolean {
  return RESET_CONFIRM_PHRASES.has(normalizeConfirmationPhrase(phrase))
}

export async function resetAccount(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.adRewardLog.deleteMany({ where: { userId } })
    await tx.pendingReward.deleteMany({ where: { userId } })
    await tx.userAchievement.deleteMany({ where: { userId } })
    await tx.userReward.deleteMany({ where: { userId } })
    await tx.mission.deleteMany({ where: { userId } })
    await tx.userThemeUnlock.deleteMany({ where: { userId } })

    await tx.reward.deleteMany({ where: { creatorId: userId } })

    await tx.user.update({
      where: { id: userId },
      data: {
        level: 1,
        xp: 0,
        currency: 0,
        themeId: DEFAULT_THEME_ID,
        streakFreeze: 0,
        frozenStreakDates: [],
        onboardingCompletedAt: null,
      },
    })
  })

  await ensureDefaultTheme(prisma, userId)
}
