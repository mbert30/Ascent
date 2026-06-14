import type { PrismaClient } from '@prisma/client'

import {
  ACHIEVEMENTS,
  type AchievementDef,
  type AchievementTierDef,
} from '@/lib/achievements/definitions'
import { countsTowardDailyQuest } from '@/lib/daily-quest'
import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'
import { addDays, toDateKey } from '@/lib/streak'
import { parseFrozenDates } from '@/lib/streak-user'

export type AchievementMetrics = {
  streak: number
  missions_completed: number
  level: number
  gold_earned: number
  daily_quest_claimed: number
  shop_redeems: number
  active_days: number
  total_xp: number
  daily_login_claimed: number
  weekly_missions: number
  goals_completed: number
  habit_completions: number
  perfect_days: number
  custom_rewards_created: number
  streak_freezes_used: number
}

export type NewAchievementTier = {
  achievementId: string
  tier: number
  gold: number
  xp: number
  icon: string
  frame: string
}

function metricValue(
  metrics: AchievementMetrics,
  metric: AchievementDef['metric']
): number {
  return metrics[metric]
}

function tierForProgress(
  def: AchievementDef,
  progress: number
): { currentTier: number; nextThreshold: number | null } {
  let currentTier = 0
  for (const t of def.tiers) {
    if (progress >= t.threshold) currentTier = t.tier
  }
  const next = def.tiers.find((t) => t.tier === currentTier + 1)
  return { currentTier, nextThreshold: next?.threshold ?? null }
}

export async function computeMetrics(
  prisma: PrismaClient,
  userId: string
): Promise<AchievementMetrics> {
  const now = new Date()
  const historyStart = new Date(now)
  historyStart.setDate(historyStart.getDate() - 365)
  historyStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      xp: true,
      currency: true,
      frozenStreakDates: true,
    },
  })

  const [
    completedMissions,
    weeklyMissions,
    dailyQuestClaimed,
    dailyLoginClaimed,
    shopRedeems,
    spentGold,
    pendingLevelGold,
    claimedAchievementGold,
    customRewardsCreated,
  ] = await Promise.all([
    prisma.mission.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        dueAt: { gte: historyStart },
      },
      select: { dueAt: true, type: true, category: true },
    }),
    prisma.mission.count({
      where: {
        userId,
        status: 'COMPLETED',
        dueAt: { gte: weekStart },
      },
    }),
    prisma.pendingReward.count({
      where: { userId, type: 'DAILY_QUEST', claimedAt: { not: null } },
    }),
    prisma.pendingReward.count({
      where: { userId, type: 'DAILY_LOGIN', claimedAt: { not: null } },
    }),
    prisma.userReward.count({ where: { userId } }),
    prisma.userReward.findMany({
      where: { userId },
      include: { reward: { select: { cost: true } } },
    }),
    prisma.pendingReward.aggregate({
      where: { userId, type: 'LEVEL_UP', claimedAt: { not: null } },
      _sum: { gold: true },
    }),
    prisma.pendingReward.aggregate({
      where: { userId, type: 'ACHIEVEMENT', claimedAt: { not: null } },
      _sum: { gold: true },
    }),
    prisma.reward.count({
      where: { creatorId: userId, type: 'REAL_LIFE' },
    }),
  ])

  const frozenDates = parseFrozenDates(user?.frozenStreakDates)
  const activeKeys = new Set<string>()
  const dayCompletionCounts = new Map<string, number>()
  let goalsCompleted = 0
  let habitCompletions = 0

  for (const m of completedMissions) {
    const key = toDateKey(m.dueAt)
    activeKeys.add(key)
    if (countsTowardDailyQuest(m.category)) {
      dayCompletionCounts.set(key, (dayCompletionCounts.get(key) ?? 0) + 1)
    }
    if (m.type === 'GOAL') goalsCompleted += 1
    if (
      m.type === 'HABIT' &&
      m.category !== DAILY_LOGIN_MISSION_CATEGORY &&
      m.category !== TUTORIAL_MISSION_CATEGORY
    ) {
      habitCompletions += 1
    }
  }
  for (const d of frozenDates) {
    activeKeys.add(d)
  }

  const perfectDays = [...dayCompletionCounts.values()].filter(
    (c) => c >= 3
  ).length

  const streak = computeStreakFromKeys(activeKeys, now)
  const activeDays = activeKeys.size
  const totalSpent = spentGold.reduce((s, r) => s + r.reward.cost, 0)
  const goldEarned =
    (user?.currency ?? 0) +
    totalSpent +
    (pendingLevelGold._sum.gold ?? 0) +
    (claimedAchievementGold._sum.gold ?? 0)

  return {
    streak,
    missions_completed: completedMissions.length,
    level: user?.level ?? 1,
    gold_earned: goldEarned,
    daily_quest_claimed: dailyQuestClaimed,
    shop_redeems: shopRedeems,
    active_days: activeDays,
    total_xp: user?.xp ?? 0,
    daily_login_claimed: dailyLoginClaimed,
    weekly_missions: weeklyMissions,
    goals_completed: goalsCompleted,
    habit_completions: habitCompletions,
    perfect_days: perfectDays,
    custom_rewards_created: customRewardsCreated,
    streak_freezes_used: frozenDates.length,
  }
}

function computeStreakFromKeys(activeKeys: Set<string>, today: Date): number {
  const todayKey = toDateKey(today)
  let cursor = activeKeys.has(todayKey) ? today : addDays(today, -1)
  if (!activeKeys.has(toDateKey(cursor))) return 0
  let streak = 0
  while (activeKeys.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export async function evaluateAchievements(
  prisma: PrismaClient,
  userId: string
): Promise<NewAchievementTier[]> {
  const metrics = await computeMetrics(prisma, userId)
  const newlyUnlocked: NewAchievementTier[] = []

  for (const def of ACHIEVEMENTS) {
    const progress = metricValue(metrics, def.metric)
    const { currentTier } = tierForProgress(def, progress)

    const previous = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId: def.id },
      },
    })
    const prevTier = previous?.currentTier ?? 0

    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId: def.id },
      },
      create: {
        userId,
        achievementId: def.id,
        progress,
        currentTier,
      },
      update: { progress, currentTier },
    })

    for (const tierDef of def.tiers) {
      if (progress < tierDef.threshold) continue

      const existing = await prisma.pendingReward.findFirst({
        where: {
          userId,
          type: 'ACHIEVEMENT',
          refAchievementId: def.id,
          refTier: tierDef.tier,
        },
      })

      if (!existing) {
        await prisma.pendingReward.create({
          data: {
            userId,
            type: 'ACHIEVEMENT',
            refAchievementId: def.id,
            refTier: tierDef.tier,
            gold: tierDef.gold,
            xp: tierDef.xp,
          },
        })
        if (tierDef.tier > prevTier) {
          newlyUnlocked.push({
            achievementId: def.id,
            tier: tierDef.tier,
            gold: tierDef.gold,
            xp: tierDef.xp,
            icon: tierDef.icon,
            frame: tierDef.frame,
          })
        }
      }
    }
  }

  return newlyUnlocked
}

export type AchievementTierView = AchievementTierDef & {
  unlocked: boolean
  claimed: boolean
  pendingId: string | null
}

export type AchievementView = {
  id: string
  nameKey: string
  descriptionKey: string
  icon: string
  progress: number
  currentTier: number
  maxTier: number
  tiers: AchievementTierView[]
  nextThreshold: number | null
  percentToNext: number
}

export async function buildAchievementViews(
  prisma: PrismaClient,
  userId: string
): Promise<AchievementView[]> {
  const metrics = await computeMetrics(prisma, userId)
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  })
  const pending = await prisma.pendingReward.findMany({
    where: { userId, type: 'ACHIEVEMENT', claimedAt: null },
  })
  const claimed = await prisma.pendingReward.findMany({
    where: { userId, type: 'ACHIEVEMENT', claimedAt: { not: null } },
  })

  const achMap = new Map(userAchievements.map((a) => [a.achievementId, a]))

  return ACHIEVEMENTS.map((def) => {
    const progress = metricValue(metrics, def.metric)
    const stored = achMap.get(def.id)
    const { currentTier, nextThreshold } = tierForProgress(def, progress)
    const effectiveTier = Math.max(stored?.currentTier ?? 0, currentTier)

    const tiers: AchievementTierView[] = def.tiers.map((t) => {
      const unlocked = progress >= t.threshold
      const pendingRow = pending.find(
        (p) => p.refAchievementId === def.id && p.refTier === t.tier
      )
      const claimedRow = claimed.find(
        (p) => p.refAchievementId === def.id && p.refTier === t.tier
      )
      return {
        ...t,
        unlocked,
        claimed: !!claimedRow?.claimedAt,
        pendingId: pendingRow?.id ?? null,
      }
    })

    let percentToNext = 100
    if (nextThreshold != null) {
      const prevThreshold =
        def.tiers.find((t) => t.tier === effectiveTier)?.threshold ?? 0
      const range = nextThreshold - prevThreshold
      percentToNext =
        range > 0
          ? Math.min(
              100,
              Math.round(((progress - prevThreshold) / range) * 100)
            )
          : 0
    }

    return {
      id: def.id,
      nameKey: def.nameKey,
      descriptionKey: def.descriptionKey,
      icon: def.icon,
      progress,
      currentTier: effectiveTier,
      maxTier: def.tiers.length,
      tiers,
      nextThreshold,
      percentToNext,
    }
  }).sort((a, b) => {
    const aUnlocked = a.currentTier > 0 ? 1 : 0
    const bUnlocked = b.currentTier > 0 ? 1 : 0
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked
    if (a.currentTier !== b.currentTier) return b.currentTier - a.currentTier
    return b.percentToNext - a.percentToNext
  })
}

export async function countUnclaimedAchievementRewards(
  prisma: PrismaClient,
  userId: string
): Promise<number> {
  return prisma.pendingReward.count({
    where: { userId, type: 'ACHIEVEMENT', claimedAt: null },
  })
}
