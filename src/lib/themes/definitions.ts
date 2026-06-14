export type ThemeUnlockCondition =
  | { type: 'default' }
  | { type: 'level'; level: number }
  | { type: 'streak'; days: number }
  | { type: 'achievement'; achievementId: string; tier: number }
  | { type: 'achievement_any'; minTier: number }
  | { type: 'all_themes' }

export type ThemeDef = {
  id: string
  nameKey: string
  descriptionKey: string
  unlock: ThemeUnlockCondition
  /** Tailwind gradient classes for picker swatch preview */
  preview: string
  priority: number
}

export const THEMES: ThemeDef[] = [
  {
    id: 'dark',
    nameKey: 'dark.name',
    descriptionKey: 'dark.description',
    unlock: { type: 'default' },
    preview: 'from-black via-indigo-950 to-fuchsia-950',
    priority: 0,
  },
  {
    id: 'lava',
    nameKey: 'lava.name',
    descriptionKey: 'lava.description',
    unlock: { type: 'level', level: 2 },
    preview: 'from-black via-orange-950 to-yellow-600',
    priority: 10,
  },
  {
    id: 'crimson',
    nameKey: 'crimson.name',
    descriptionKey: 'crimson.description',
    unlock: { type: 'level', level: 5 },
    preview: 'from-black via-red-950 to-orange-900',
    priority: 20,
  },
  {
    id: 'ocean',
    nameKey: 'ocean.name',
    descriptionKey: 'ocean.description',
    unlock: { type: 'level', level: 10 },
    preview: 'from-[#001a33] via-cyan-900 to-[#003366]',
    priority: 30,
  },
  {
    id: 'midnight',
    nameKey: 'midnight.name',
    descriptionKey: 'midnight.description',
    unlock: { type: 'level', level: 15 },
    preview: 'from-black via-violet-950 to-blue-950',
    priority: 40,
  },
  {
    id: 'rainbow',
    nameKey: 'rainbow.name',
    descriptionKey: 'rainbow.description',
    unlock: { type: 'achievement', achievementId: 'streak_master', tier: 2 },
    preview: 'from-red-500 via-yellow-400 to-blue-500',
    priority: 50,
  },
  {
    id: 'aurora',
    nameKey: 'aurora.name',
    descriptionKey: 'aurora.description',
    unlock: { type: 'streak', days: 14 },
    preview: 'from-fuchsia-900 via-violet-800 to-cyan-700',
    priority: 60,
  },
  {
    id: 'neon',
    nameKey: 'neon.name',
    descriptionKey: 'neon.description',
    unlock: { type: 'achievement', achievementId: 'mission_hunter', tier: 2 },
    preview: 'from-black via-fuchsia-950 to-lime-400',
    priority: 70,
  },
  {
    id: 'prism',
    nameKey: 'prism.name',
    descriptionKey: 'prism.description',
    unlock: { type: 'achievement_any', minTier: 4 },
    preview: 'from-cyan-300 via-fuchsia-400 to-amber-300',
    priority: 80,
  },
  {
    id: 'ascended',
    nameKey: 'ascended.name',
    descriptionKey: 'ascended.description',
    unlock: { type: 'all_themes' },
    preview: 'from-amber-200 via-yellow-100 to-violet-300',
    priority: 90,
  },
]

export const DEFAULT_THEME_ID = 'dark'

export type ThemeEvalContext = {
  level: number
  streak: number
  achievementTiers: Record<string, number>
  ownedThemeIds: Set<string>
}

export function getThemeById(id: string): ThemeDef | undefined {
  return THEMES.find((t) => t.id === id)
}

export function unlockSourceKey(unlock: ThemeUnlockCondition): string {
  switch (unlock.type) {
    case 'default':
      return 'default'
    case 'level':
      return `level:${unlock.level}`
    case 'streak':
      return `streak:${unlock.days}`
    case 'achievement':
      return `achievement:${unlock.achievementId}:${unlock.tier}`
    case 'achievement_any':
      return `achievement_any:${unlock.minTier}`
    case 'all_themes':
      return 'all_themes'
  }
}

export function isThemeEligible(
  theme: ThemeDef,
  ctx: ThemeEvalContext
): boolean {
  const { unlock } = theme
  switch (unlock.type) {
    case 'default':
      return true
    case 'level':
      return ctx.level >= unlock.level
    case 'streak':
      return ctx.streak >= unlock.days
    case 'achievement':
      return (ctx.achievementTiers[unlock.achievementId] ?? 0) >= unlock.tier
    case 'achievement_any':
      return Object.values(ctx.achievementTiers).some(
        (tier) => tier >= unlock.minTier
      )
    case 'all_themes':
      return THEMES.filter((t) => t.id !== theme.id).every((t) =>
        ctx.ownedThemeIds.has(t.id)
      )
  }
}

export function getUnlockHintKey(theme: ThemeDef): string {
  const { unlock } = theme
  switch (unlock.type) {
    case 'default':
      return 'unlockSource.default'
    case 'level':
      return 'unlockSource.level'
    case 'streak':
      return 'unlockSource.streak'
    case 'achievement':
      return 'unlockSource.achievement'
    case 'achievement_any':
      return 'unlockSource.achievementAny'
    case 'all_themes':
      return 'unlockSource.allThemes'
  }
}

export function getUnlockHintParams(
  theme: ThemeDef
): Record<string, string | number> {
  const { unlock } = theme
  switch (unlock.type) {
    case 'default':
      return {}
    case 'level':
      return { level: unlock.level }
    case 'streak':
      return { days: unlock.days }
    case 'achievement':
      return { achievementId: unlock.achievementId, tier: unlock.tier }
    case 'achievement_any':
      return { tier: unlock.minTier }
    case 'all_themes':
      return { count: THEMES.length - 1 }
  }
}

const ACHIEVEMENT_NAME_KEYS: Record<string, string> = {
  streak_master: 'streakMaster.name',
  mission_hunter: 'missionHunter.name',
}

export function getAchievementNameKeyForTheme(theme: ThemeDef): string | null {
  if (theme.unlock.type !== 'achievement') return null
  return ACHIEVEMENT_NAME_KEYS[theme.unlock.achievementId] ?? null
}

export function getUnlockDetailKey(theme: ThemeDef): string {
  switch (theme.unlock.type) {
    case 'default':
      return 'unlockDetail.default'
    case 'level':
      return 'unlockDetail.level'
    case 'streak':
      return 'unlockDetail.streak'
    case 'achievement':
      return 'unlockDetail.achievement'
    case 'achievement_any':
      return 'unlockDetail.achievementAny'
    case 'all_themes':
      return 'unlockDetail.allThemes'
  }
}

export function getUnlockDetailParams(
  theme: ThemeDef
): Record<string, string | number> {
  const { unlock } = theme
  switch (unlock.type) {
    case 'default':
      return {}
    case 'level':
      return { level: unlock.level }
    case 'streak':
      return { days: unlock.days }
    case 'achievement':
      return { tier: unlock.tier, achievementId: unlock.achievementId }
    case 'achievement_any':
      return { tier: unlock.minTier }
    case 'all_themes':
      return { count: THEMES.length - 1 }
  }
}
