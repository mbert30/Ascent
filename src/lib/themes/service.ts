import type { PrismaClient } from '@prisma/client'

import {
  DEFAULT_THEME_ID,
  THEMES,
  type ThemeEvalContext,
  getThemeById,
  isThemeEligible,
  unlockSourceKey,
} from '@/lib/themes/definitions'

export async function ensureDefaultTheme(prisma: PrismaClient, userId: string) {
  await prisma.userThemeUnlock.upsert({
    where: {
      userId_themeId: { userId, themeId: DEFAULT_THEME_ID },
    },
    create: {
      userId,
      themeId: DEFAULT_THEME_ID,
      source: 'default',
    },
    update: {},
  })
}

export async function getThemeState(prisma: PrismaClient, userId: string) {
  const [user, unlocks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { themeId: true },
    }),
    prisma.userThemeUnlock.findMany({
      where: { userId },
      select: { themeId: true },
    }),
  ])

  return {
    themeId: user?.themeId ?? DEFAULT_THEME_ID,
    unlockedThemeIds: unlocks.map((u) => u.themeId),
  }
}

export async function buildThemeEvalContext(
  prisma: PrismaClient,
  userId: string,
  level: number,
  streak: number
): Promise<ThemeEvalContext> {
  const [achievements, unlocks] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, currentTier: true },
    }),
    prisma.userThemeUnlock.findMany({
      where: { userId },
      select: { themeId: true },
    }),
  ])

  const achievementTiers: Record<string, number> = {}
  for (const a of achievements) {
    achievementTiers[a.achievementId] = a.currentTier
  }

  return {
    level,
    streak,
    achievementTiers,
    ownedThemeIds: new Set(unlocks.map((u) => u.themeId)),
  }
}

export type ThemeUnlockResult = {
  newThemeId: string | null
  allNewThemeIds: string[]
}

export async function evaluateThemeUnlocks(
  prisma: PrismaClient,
  userId: string,
  ctx: ThemeEvalContext
): Promise<ThemeUnlockResult> {
  const newlyEligible = THEMES.filter(
    (theme) => !ctx.ownedThemeIds.has(theme.id) && isThemeEligible(theme, ctx)
  ).sort((a, b) => a.priority - b.priority)

  if (newlyEligible.length === 0) {
    return { newThemeId: null, allNewThemeIds: [] }
  }

  const allNewThemeIds = newlyEligible.map((t) => t.id)
  const newThemeId = allNewThemeIds[0] ?? null

  await prisma.$transaction(
    newlyEligible.map((theme) =>
      prisma.userThemeUnlock.create({
        data: {
          userId,
          themeId: theme.id,
          source: unlockSourceKey(theme.unlock),
        },
      })
    )
  )

  return { newThemeId, allNewThemeIds }
}

export async function setActiveTheme(
  prisma: PrismaClient,
  userId: string,
  themeId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getThemeById(themeId)) {
    return { ok: false, error: 'Unknown theme' }
  }

  const owned = await prisma.userThemeUnlock.findUnique({
    where: { userId_themeId: { userId, themeId } },
  })
  if (!owned) {
    return { ok: false, error: 'Theme not unlocked' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { themeId },
  })

  return { ok: true }
}
