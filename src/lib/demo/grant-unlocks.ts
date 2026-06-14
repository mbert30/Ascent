import {
  MissionStatus,
  MissionType,
  type PrismaClient,
  RewardType,
} from '@prisma/client'

import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { THEMES, unlockSourceKey } from '@/lib/themes/definitions'

const MAX_TIER = 4
const MAX_LEVEL = 20
const DEMO_GOLD = 10_000
const DEMO_XP = 15_000

export type GrantDemoUnlocksResult = {
  themes: number
  achievements: number
  level: number
  gold: number
}

function atDaysAgo(daysAgo: number, hour = 12): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 0, 0, 0)
  return date
}

function buildDemoMissions(userId: string) {
  const missions: Array<{
    userId: string
    title: string
    category: string
    type: MissionType
    xp: number
    dueAt: Date
    status: MissionStatus
  }> = []

  for (let i = 0; i < 150; i += 1) {
    const dayOffset = i % 7
    missions.push({
      userId,
      title: `Demo weekly ${i + 1}`,
      category: 'Demo',
      type: i % 4 === 0 ? MissionType.GOAL : MissionType.HABIT,
      xp: 10,
      dueAt: atDaysAgo(dayOffset, 9 + (i % 8)),
      status: MissionStatus.COMPLETED,
    })
  }

  for (let day = 0; day < 35; day += 1) {
    missions.push({
      userId,
      title: `Demo streak day ${day + 1}`,
      category: 'Demo',
      type: MissionType.HABIT,
      xp: 12,
      dueAt: atDaysAgo(day, 8),
      status: MissionStatus.COMPLETED,
    })
  }

  for (let day = 35; day < 110; day += 1) {
    for (let slot = 0; slot < 3; slot += 1) {
      missions.push({
        userId,
        title: `Demo perfect ${day}-${slot}`,
        category: 'Demo',
        type: slot === 2 ? MissionType.GOAL : MissionType.HABIT,
        xp: 10,
        dueAt: atDaysAgo(day, 10 + slot),
        status: MissionStatus.COMPLETED,
      })
    }
  }

  for (let i = 0; i < 120; i += 1) {
    missions.push({
      userId,
      title: `Demo extra ${i + 1}`,
      category: 'Demo',
      type: MissionType.HABIT,
      xp: 8,
      dueAt: atDaysAgo(110 + (i % 60), 14),
      status: MissionStatus.COMPLETED,
    })
  }

  return missions
}

function buildFrozenDates(count: number): string[] {
  const dates: string[] = []
  for (let i = 0; i < count; i += 1) {
    const d = atDaysAgo(200 + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export async function grantDemoUnlocks(
  prisma: PrismaClient,
  userId: string
): Promise<GrantDemoUnlocksResult> {
  return prisma.$transaction(async (tx) => {
    const frozenDates = buildFrozenDates(20)

    await tx.user.update({
      where: { id: userId },
      data: {
        level: MAX_LEVEL,
        xp: DEMO_XP,
        currency: DEMO_GOLD,
        frozenStreakDates: frozenDates,
      },
    })

    const demoMissionCount = await tx.mission.count({
      where: { userId, category: 'Demo' },
    })
    if (demoMissionCount === 0) {
      await tx.mission.createMany({
        data: buildDemoMissions(userId),
      })
    }

    const customRewardCount = await tx.reward.count({
      where: { creatorId: userId, title: { startsWith: 'Demo reward' } },
    })
    if (customRewardCount === 0) {
      for (let i = 0; i < 20; i += 1) {
        await tx.reward.create({
          data: {
            creatorId: userId,
            title: `Demo reward ${i + 1}`,
            cost: 50,
            type: RewardType.REAL_LIFE,
            icon: '🎁',
          },
        })
      }
    }

    const shopRedeemCount = await tx.userReward.count({ where: { userId } })
    if (shopRedeemCount < 35) {
      const shopReward = await tx.reward.create({
        data: {
          title: 'Demo shop item',
          cost: 100,
          type: RewardType.COSMETIC,
          icon: '🛍️',
        },
      })

      for (let i = shopRedeemCount; i < 35; i += 1) {
        await tx.userReward.create({
          data: {
            userId,
            rewardId: shopReward.id,
          },
        })
      }
    }

    const dailyQuestClaimed = await tx.pendingReward.count({
      where: { userId, type: 'DAILY_QUEST', claimedAt: { not: null } },
    })
    if (dailyQuestClaimed < 75) {
      for (let i = dailyQuestClaimed; i < 75; i += 1) {
        await tx.pendingReward.create({
          data: {
            userId,
            type: 'DAILY_QUEST',
            gold: 10,
            xp: 25,
            claimedAt: atDaysAgo(i % 30),
          },
        })
      }
    }

    const dailyLoginClaimed = await tx.pendingReward.count({
      where: { userId, type: 'DAILY_LOGIN', claimedAt: { not: null } },
    })
    if (dailyLoginClaimed < 30) {
      for (let i = dailyLoginClaimed; i < 30; i += 1) {
        await tx.pendingReward.create({
          data: {
            userId,
            type: 'DAILY_LOGIN',
            gold: 5,
            xp: 10,
            claimedAt: atDaysAgo(i),
          },
        })
      }
    }

    for (const theme of THEMES) {
      await tx.userThemeUnlock.upsert({
        where: {
          userId_themeId: { userId, themeId: theme.id },
        },
        create: {
          userId,
          themeId: theme.id,
          source: unlockSourceKey(theme.unlock),
        },
        update: {},
      })
    }

    for (const def of ACHIEVEMENTS) {
      const lastTier = def.tiers[def.tiers.length - 1]
      const progress = lastTier.threshold

      await tx.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: def.id },
        },
        create: {
          userId,
          achievementId: def.id,
          progress,
          currentTier: MAX_TIER,
        },
        update: { progress, currentTier: MAX_TIER },
      })

      for (const tier of def.tiers) {
        const existing = await tx.pendingReward.findFirst({
          where: {
            userId,
            type: 'ACHIEVEMENT',
            refAchievementId: def.id,
            refTier: tier.tier,
          },
        })

        if (existing) {
          await tx.pendingReward.update({
            where: { id: existing.id },
            data: { claimedAt: existing.claimedAt ?? new Date() },
          })
        } else {
          await tx.pendingReward.create({
            data: {
              userId,
              type: 'ACHIEVEMENT',
              refAchievementId: def.id,
              refTier: tier.tier,
              gold: tier.gold,
              xp: tier.xp,
              claimedAt: new Date(),
            },
          })
        }
      }
    }

    return {
      themes: THEMES.length,
      achievements: ACHIEVEMENTS.length,
      level: MAX_LEVEL,
      gold: DEMO_GOLD,
    }
  })
}
