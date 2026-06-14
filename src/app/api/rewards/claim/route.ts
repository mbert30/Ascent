import { NextRequest, NextResponse } from 'next/server'

import { getAchievementById } from '@/lib/achievements/definitions'
import { evaluateAchievements } from '@/lib/achievements/service'
import { auth } from '@/lib/auth'
import { applyXpAndLevelOnly } from '@/lib/levels'
import { DAILY_LOGIN_MISSION_CATEGORY } from '@/lib/missions/special'
import { createLevelUpRewards } from '@/lib/pending-rewards-service'
import { prisma } from '@/lib/prisma'
import { runThemeUnlockEvaluation } from '@/lib/themes/evaluate'
import { getThemeState } from '@/lib/themes/service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : null
    if (!id) {
      return NextResponse.json({ error: 'Missing reward id' }, { status: 400 })
    }

    const pending = await prisma.pendingReward.findFirst({
      where: {
        id,
        userId: session.user.id,
        claimedAt: null,
      },
    })
    if (!pending) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true, currency: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let { xp, level, currency } = {
      xp: user.xp,
      level: user.level,
      currency: user.currency,
    }

    if (pending.xp > 0) {
      const applied = applyXpAndLevelOnly(xp, level, pending.xp)
      xp = applied.xp
      level = applied.level
      if (applied.newLevels.length > 0) {
        await createLevelUpRewards(prisma, session.user.id, applied.newLevels)
      }
    }

    currency += pending.gold

    await prisma.$transaction([
      prisma.pendingReward.update({
        where: { id: pending.id },
        data: { claimedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { xp, level, currency },
      }),
      ...(pending.type === 'DAILY_LOGIN'
        ? [
            prisma.mission.updateMany({
              where: {
                userId: session.user.id,
                category: DAILY_LOGIN_MISSION_CATEGORY,
                status: 'SCHEDULED',
              },
              data: { status: 'COMPLETED' },
            }),
          ]
        : []),
    ])

    if (
      pending.type === 'DAILY_LOGIN' ||
      pending.type === 'DAILY_QUEST' ||
      pending.type === 'ACHIEVEMENT'
    ) {
      await evaluateAchievements(prisma, session.user.id)
    }

    const themeResult = await runThemeUnlockEvaluation(
      prisma,
      session.user.id,
      level
    )
    const themeState = await getThemeState(prisma, session.user.id)

    const achievementDef =
      pending.type === 'ACHIEVEMENT' && pending.refAchievementId
        ? getAchievementById(pending.refAchievementId)
        : null
    const achievementTier =
      pending.type === 'ACHIEVEMENT' && pending.refTier
        ? achievementDef?.tiers.find((t) => t.tier === pending.refTier)
        : null

    return NextResponse.json({
      type: pending.type,
      refLevel: pending.refLevel,
      refAchievementId: pending.refAchievementId,
      refTier: pending.refTier,
      achievementIcon: achievementTier?.icon ?? achievementDef?.icon ?? null,
      achievementFrame: achievementTier?.frame ?? null,
      gold: pending.gold,
      xp: pending.xp,
      user: { level, xp, currency },
      themeUnlock: themeResult.newThemeId
        ? { themeId: themeResult.newThemeId }
        : undefined,
      unlockedThemeIds: themeState.unlockedThemeIds,
    })
  } catch (error) {
    console.error('Claim reward error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
