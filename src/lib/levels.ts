/**
 * Level thresholds and rewards — used server-side for XP/level/gold when completing missions.
 * Must stay in sync with dashboard data for display.
 */
export const LEVELS = [
  { level: 1, xpRequired: 0, reward: { gold: 15 } },
  { level: 2, xpRequired: 50, reward: { gold: 20 } },
  { level: 3, xpRequired: 125, reward: { gold: 25 } },
  { level: 4, xpRequired: 225, reward: { gold: 30 } },
  { level: 5, xpRequired: 375, reward: { gold: 35 } },
  { level: 6, xpRequired: 575, reward: { gold: 40 } },
  { level: 7, xpRequired: 850, reward: { gold: 50 } },
  { level: 8, xpRequired: 1200, reward: { gold: 60 } },
  { level: 9, xpRequired: 1650, reward: { gold: 70 } },
  { level: 10, xpRequired: 2200, reward: { gold: 80 } },
  { level: 11, xpRequired: 2900, reward: { gold: 100 } },
  { level: 12, xpRequired: 3500, reward: { gold: 120 } },
  { level: 13, xpRequired: 5000, reward: { gold: 150 } },
  { level: 14, xpRequired: 7000, reward: { gold: 180 } },
  { level: 15, xpRequired: 9500, reward: { gold: 220 } },
  { level: 16, xpRequired: 12000, reward: { gold: 260 } },
  { level: 17, xpRequired: 15000, reward: { gold: 300 } },
  { level: 18, xpRequired: 18500, reward: { gold: 350 } },
  { level: 19, xpRequired: 22500, reward: { gold: 400 } },
  { level: 20, xpRequired: 27000, reward: { gold: 500 } },
] as const

export function getLevel(level: number) {
  return LEVELS.find((l) => l.level === level)
}

export function getNextLevel(level: number) {
  return LEVELS.find((l) => l.level === level + 1)
}

export function applyXpAndLevelUp(
  currentXp: number,
  currentLevel: number,
  currentCurrency: number,
  xpToAdd: number
): { xp: number; level: number; currency: number } {
  const xp = currentXp + xpToAdd
  let level = currentLevel
  let currency = currentCurrency
  let next = getNextLevel(level)
  while (next && xp >= next.xpRequired) {
    level = next.level
    currency += next.reward.gold
    next = getNextLevel(level)
  }
  return { xp, level, currency }
}

/** Recompute level and total currency from total XP (e.g. when uncompleting a mission). */
export function getLevelAndCurrencyFromXp(totalXp: number): {
  level: number
  currency: number
} {
  const clampedXp = Math.max(0, totalXp)
  let level = 1
  let currency = 0
  let next = getNextLevel(level)
  while (next && clampedXp >= next.xpRequired) {
    level = next.level
    currency += next.reward.gold
    next = getNextLevel(level)
  }
  return { level, currency }
}
