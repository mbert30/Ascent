import type { PrismaClient } from '@prisma/client'

import { getUserStreakContext } from '@/lib/streak-user'
import {
  buildThemeEvalContext,
  evaluateThemeUnlocks,
} from '@/lib/themes/service'

export async function runThemeUnlockEvaluation(
  prisma: PrismaClient,
  userId: string,
  level: number
) {
  const streakCtx = await getUserStreakContext(prisma, userId)
  const ctx = await buildThemeEvalContext(
    prisma,
    userId,
    level,
    streakCtx.currentStreak
  )
  return evaluateThemeUnlocks(prisma, userId, ctx)
}
