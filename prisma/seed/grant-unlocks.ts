import { PrismaClient } from '@prisma/client'

// ts-node CJS bridge for app modules
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ACHIEVEMENTS } = require('../../src/lib/achievements/definitions') as {
  ACHIEVEMENTS: Array<{
    id: string
    tiers: Array<{
      tier: number
      threshold: number
      gold: number
      xp: number
    }>
  }>
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { THEMES, unlockSourceKey } =
  require('../../src/lib/themes/definitions') as {
    THEMES: Array<{ id: string; unlock: { type: string } }>
    unlockSourceKey: (unlock: { type: string }) => string
  }

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] ?? 'axel.lapierre@majoli.io'

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, level: true },
  })

  if (!user) {
    console.error(`No user found for email: ${email}`)
    process.exit(1)
  }

  const maxTier = 4
  const maxLevel = 20

  await prisma.user.update({
    where: { id: user.id },
    data: { level: Math.max(user.level, maxLevel) },
  })

  for (const theme of THEMES) {
    await prisma.userThemeUnlock.upsert({
      where: {
        userId_themeId: { userId: user.id, themeId: theme.id },
      },
      create: {
        userId: user.id,
        themeId: theme.id,
        source: unlockSourceKey(theme.unlock),
      },
      update: {},
    })
  }

  for (const def of ACHIEVEMENTS) {
    const lastTier = def.tiers[def.tiers.length - 1]
    const progress = lastTier.threshold

    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: { userId: user.id, achievementId: def.id },
      },
      create: {
        userId: user.id,
        achievementId: def.id,
        progress,
        currentTier: maxTier,
      },
      update: { progress, currentTier: maxTier },
    })

    for (const tier of def.tiers) {
      const existing = await prisma.pendingReward.findFirst({
        where: {
          userId: user.id,
          type: 'ACHIEVEMENT',
          refAchievementId: def.id,
          refTier: tier.tier,
        },
      })

      if (existing) {
        await prisma.pendingReward.update({
          where: { id: existing.id },
          data: { claimedAt: existing.claimedAt ?? new Date() },
        })
      } else {
        await prisma.pendingReward.create({
          data: {
            userId: user.id,
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

  console.log(
    `Granted ${THEMES.length} themes and ${ACHIEVEMENTS.length} achievements (tier ${maxTier}) to ${user.email}`
  )
}

main()
  .catch((e) => {
    console.error('Grant unlocks failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
