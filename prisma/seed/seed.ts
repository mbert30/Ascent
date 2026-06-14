import {
  Difficulty,
  HabitType,
  MissionStatus,
  MissionType,
  Prisma,
  PrismaClient,
  RewardType,
} from '@prisma/client'

const prisma = new PrismaClient()

const SEED_EMAIL = 'seed+user@seed.local'
const DEMO_USER_IDS = [
  'cmiivz82k0000enb2xae4e85t',
  'cmmbr1xvk0000maukql7fj948',
  'cmmbrax7100008ksspqfilsdb',
] as const

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const atHour = (daysAgo: number, hour: number, minute = 0) => {
  const date = new Date(Date.now() - daysAgo * DAY)
  date.setHours(hour, minute, 0, 0)
  return date
}

const levelFromXp = (xp: number) => Math.floor(xp / 100) + 1

const atDayOffset = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

function getMissionStatus(
  dayOffset: number,
  template: { type: MissionType; hour: number }
): MissionStatus {
  if (dayOffset > 0) return MissionStatus.SCHEDULED

  if (dayOffset === 0) {
    return template.hour <= 10
      ? MissionStatus.COMPLETED
      : MissionStatus.SCHEDULED
  }

  // Recent streak window: at least one habit completed each day.
  if (dayOffset >= -5) {
    if (template.type === MissionType.HABIT) return MissionStatus.COMPLETED
    return dayOffset >= -2 ? MissionStatus.COMPLETED : MissionStatus.OVERDUE
  }

  // Older days: scattered activity for calendar history.
  const abs = Math.abs(dayOffset)
  const dayHasActivity = abs % 2 === 0 || abs % 3 === 0
  if (!dayHasActivity) return MissionStatus.OVERDUE
  if (template.type === MissionType.HABIT) return MissionStatus.COMPLETED
  return abs % 4 === 0 ? MissionStatus.COMPLETED : MissionStatus.OVERDUE
}

async function main() {
  console.log('🌱 Démarrage du seeder...')

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: SEED_EMAIL },
      create: {
        email: SEED_EMAIL,
        bio: 'Building consistency one mission at a time.',
        themeId: 'dark',
      },
      update: {
        bio: 'Building consistency one mission at a time.',
        themeId: 'dark',
      },
    })

    await tx.userThemeUnlock.upsert({
      where: {
        userId_themeId: { userId: user.id, themeId: 'dark' },
      },
      create: {
        userId: user.id,
        themeId: 'dark',
        source: 'default',
      },
      update: {},
    })

    // Keep seed deterministic across reruns.
    await tx.userReward.deleteMany({ where: { userId: user.id } })
    await tx.userBadge.deleteMany({ where: { userId: user.id } })
    await tx.habitLog.deleteMany({ where: { userId: user.id } })
    await tx.habit.deleteMany({ where: { userId: user.id } })
    const habits = await Promise.all([
      tx.habit.create({
        data: {
          userId: user.id,
          title: 'Hydration tracker',
          description: 'Drink at least 2L of water throughout the day.',
          type: HabitType.DAILY_HABIT,
          difficulty: Difficulty.EASY,
          xpReward: 12,
          goldReward: 4,
          currentStreak: 6,
          longestStreak: 11,
        },
      }),
      tx.habit.create({
        data: {
          userId: user.id,
          title: 'Strength workout',
          description: 'Complete a focused 35-minute training session.',
          type: HabitType.DAILY_HABIT,
          difficulty: Difficulty.MEDIUM,
          xpReward: 28,
          goldReward: 10,
          currentStreak: 4,
          longestStreak: 9,
        },
      }),
      tx.habit.create({
        data: {
          userId: user.id,
          title: 'Read for 20 minutes',
          description: 'Read non-fiction and capture one key takeaway.',
          type: HabitType.DAILY_HABIT,
          difficulty: Difficulty.EASY,
          xpReward: 16,
          goldReward: 6,
          currentStreak: 8,
          longestStreak: 15,
        },
      }),
    ])

    const habitLogs = [
      // Recent activity log entries across several days.
      {
        habitId: habits[0].id,
        userId: user.id,
        xpEarned: 12,
        goldEarned: 4,
        completedAt: atHour(6, 8, 20),
      },
      {
        habitId: habits[2].id,
        userId: user.id,
        xpEarned: 16,
        goldEarned: 6,
        completedAt: atHour(5, 22, 15),
      },
      {
        habitId: habits[1].id,
        userId: user.id,
        xpEarned: 28,
        goldEarned: 10,
        completedAt: atHour(4, 19, 10),
      },
      {
        habitId: habits[0].id,
        userId: user.id,
        xpEarned: 12,
        goldEarned: 4,
        completedAt: atHour(3, 8, 5),
      },
      {
        habitId: habits[2].id,
        userId: user.id,
        xpEarned: 16,
        goldEarned: 6,
        completedAt: atHour(2, 21, 45),
      },
      {
        habitId: habits[1].id,
        userId: user.id,
        xpEarned: 28,
        goldEarned: 10,
        completedAt: atHour(1, 18, 30),
      },
    ]

    await tx.habitLog.createMany({ data: habitLogs })

    const missionTemplates = [
      {
        title: 'Routine de mobilite matinale',
        category: 'Fitness',
        type: MissionType.HABIT,
        xp: 24,
        hour: 7,
      },
      {
        title: 'Bloc de travail profond',
        category: 'Productivite',
        type: MissionType.GOAL,
        xp: 34,
        hour: 10,
      },
      {
        title: 'Session de lecture concentree',
        category: 'Apprentissage',
        type: MissionType.HABIT,
        xp: 20,
        hour: 20,
      },
    ] as const

    const existingDemoUsers = await tx.user.findMany({
      where: { id: { in: [...DEMO_USER_IDS] } },
      select: { id: true },
    })
    const missionRecipientIds = Array.from(
      new Set([user.id, ...existingDemoUsers.map((u) => u.id)])
    )
    await tx.mission.deleteMany({
      where: { userId: { in: missionRecipientIds } },
    })

    const missionData: Prisma.MissionCreateManyInput[] = []
    for (const recipientId of missionRecipientIds) {
      for (let dayOffset = -35; dayOffset <= 6; dayOffset++) {
        for (const template of missionTemplates) {
          const dueAt = atDayOffset(dayOffset, template.hour, 0)
          const status = getMissionStatus(dayOffset, template)

          missionData.push({
            userId: recipientId,
            title: template.title,
            category: template.category,
            type: template.type,
            xp: template.xp,
            dueAt,
            status,
          })
        }
      }
    }

    await tx.mission.createMany({ data: missionData })

    const rewards = await Promise.all([
      tx.reward.upsert({
        where: { id: 'seed-reward-focus-music' },
        create: {
          id: 'seed-reward-focus-music',
          title: 'Focus playlist unlock',
          cost: 120,
          type: RewardType.COSMETIC,
          icon: '🎧',
        },
        update: {},
      }),
      tx.reward.upsert({
        where: { id: 'seed-reward-brunch' },
        create: {
          id: 'seed-reward-brunch',
          title: 'Sunday brunch',
          cost: 180,
          type: RewardType.REAL_LIFE,
          icon: '🥐',
        },
        update: {},
      }),
    ])

    await tx.userReward.create({
      data: {
        userId: user.id,
        rewardId: rewards[0].id,
        purchasedAt: atHour(2, 22, 0),
      },
    })

    const firstMilestoneBadge = await tx.badge.upsert({
      where: { id: 'seed-badge-first-week' },
      create: {
        id: 'seed-badge-first-week',
        name: 'Seven Day Flow',
        description: 'Log activity on 7 separate days.',
        icon: '🔥',
        condition: 'ACTIVE_7_DAYS',
      },
      update: {},
    })

    await tx.userBadge.create({
      data: {
        userId: user.id,
        badgeId: firstMilestoneBadge.id,
        unlockedAt: atHour(2, 22, 10),
      },
    })

    const totalXp = habitLogs.reduce((sum, log) => sum + log.xpEarned, 0)
    const totalGold = habitLogs.reduce((sum, log) => sum + log.goldEarned, 0)
    const spentGold = rewards[0].cost

    await tx.user.update({
      where: { id: user.id },
      data: {
        xp: totalXp,
        level: levelFromXp(totalXp),
        currency: Math.max(totalGold - spentGold, 0),
      },
    })
  })

  console.log('✨ Seeding complété — données réalistes insérées.')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
