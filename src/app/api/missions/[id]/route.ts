import { NextRequest, NextResponse } from 'next/server'

import { evaluateAchievements } from '@/lib/achievements/service'
import { auth } from '@/lib/auth'
import { DAILY_QUEST_TARGET } from '@/lib/daily-quest'
import { applyXpAndLevelOnly, getLevelFromXp } from '@/lib/levels'
import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'
import {
  createLevelUpRewards,
  maybeCreateDailyQuestReward,
  maybeRevokeDailyQuestReward,
  pruneStaleLevelRewards,
} from '@/lib/pending-rewards-service'
import { prisma } from '@/lib/prisma'
import { applyStreakMultiplier, getUserStreakContext } from '@/lib/streak-user'
import { runThemeUnlockEvaluation } from '@/lib/themes/evaluate'
import { updateMissionSchema } from '@/lib/validation/mission'

const SPECIAL_MISSION_CATEGORIES = [
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.mission.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateMissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.title != null) data.title = parsed.data.title
    if (parsed.data.category != null) data.category = parsed.data.category
    if (parsed.data.type != null) data.type = parsed.data.type
    if (parsed.data.xp != null) data.xp = parsed.data.xp
    if (parsed.data.dueAt != null) data.dueAt = new Date(parsed.data.dueAt)
    if (parsed.data.status != null) data.status = parsed.data.status

    let baseXp = existing.xp
    let multiplier = 1
    let bonusPercent = 0
    let effectiveXp = existing.xp

    if (parsed.data.status === 'COMPLETED') {
      const streakCtx = await getUserStreakContext(prisma, session.user.id)
      multiplier = streakCtx.multiplier
      bonusPercent = streakCtx.bonusPercent
      baseXp = existing.xp
      effectiveXp = applyStreakMultiplier(baseXp, multiplier)
      data.xpApplied = effectiveXp
    } else if (parsed.data.status === 'SCHEDULED') {
      data.xpApplied = null
    }

    const mission = await prisma.mission.update({
      where: { id },
      data,
    })

    let updatedUser: { level: number; xp: number; currency: number } | undefined
    let newLevelRewards = 0
    let newAchievements: Awaited<ReturnType<typeof evaluateAchievements>> = []
    let themeUnlock: { themeId: string } | undefined
    let unlockedThemeIds: string[] = []

    if (parsed.data.status === 'COMPLETED') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, currency: true },
      })
      if (user) {
        const { xp, level, newLevels } = applyXpAndLevelOnly(
          user.xp,
          user.level,
          effectiveXp
        )
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp, level },
        })
        if (newLevels.length > 0) {
          await createLevelUpRewards(prisma, session.user.id, newLevels)
          newLevelRewards = newLevels.length
        }
        await maybeCreateDailyQuestReward(
          prisma,
          session.user.id,
          DAILY_QUEST_TARGET
        )
        newAchievements = await evaluateAchievements(prisma, session.user.id)
        const themeResult = await runThemeUnlockEvaluation(
          prisma,
          session.user.id,
          level
        )
        if (themeResult.newThemeId) {
          themeUnlock = { themeId: themeResult.newThemeId }
        }
        unlockedThemeIds = themeResult.allNewThemeIds
        updatedUser = { level, xp, currency: user.currency }
      }
    } else if (parsed.data.status === 'SCHEDULED') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, currency: true },
      })
      if (user) {
        const xpToRemove = existing.xpApplied ?? existing.xp
        const newXp = Math.max(0, user.xp - xpToRemove)
        const level = getLevelFromXp(newXp)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp: newXp, level },
        })
        await pruneStaleLevelRewards(prisma, session.user.id, level)
        await maybeRevokeDailyQuestReward(
          prisma,
          session.user.id,
          DAILY_QUEST_TARGET
        )
        updatedUser = { level, xp: newXp, currency: user.currency }
      }
    }

    return NextResponse.json({
      id: mission.id,
      title: mission.title,
      category: mission.category,
      type: mission.type,
      xp: mission.xp,
      baseXp,
      multiplier,
      bonusPercent,
      effectiveXp,
      dueAt: mission.dueAt.toISOString(),
      status: mission.status,
      user: updatedUser,
      newLevelRewards,
      newAchievements,
      themeUnlock,
      unlockedThemeIds,
    })
  } catch (error) {
    console.error('Mission PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const scope =
      new URL(request.url).searchParams.get('scope') === 'future'
        ? 'future'
        : 'single'

    const existing = await prisma.mission.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    if (scope === 'future') {
      const dayStart = new Date(
        Date.UTC(
          existing.dueAt.getUTCFullYear(),
          existing.dueAt.getUTCMonth(),
          existing.dueAt.getUTCDate()
        )
      )
      if (existing.repeatKey) {
        await prisma.mission.deleteMany({
          where: {
            userId: session.user.id,
            repeatKey: existing.repeatKey,
            dueAt: { gte: dayStart },
          },
        })
      } else if (
        existing.type === 'HABIT' &&
        !SPECIAL_MISSION_CATEGORIES.includes(existing.category)
      ) {
        await prisma.mission.deleteMany({
          where: {
            userId: session.user.id,
            title: existing.title,
            category: existing.category,
            type: 'HABIT',
            dueAt: { gte: dayStart },
          },
        })
      } else {
        await prisma.mission.delete({ where: { id } })
      }
    } else {
      await prisma.mission.delete({ where: { id } })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Mission DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
