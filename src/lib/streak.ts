const STREAK_GOAL_DAYS = 7

export const THEME_UNLOCK_OBJECTIVES = [
  { level: 5, themeId: 'crimson' },
  { level: 10, themeId: 'ocean' },
  { level: 15, themeId: 'midnight' },
  { streakDays: 14, themeId: 'aurora' },
] as const

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 12, 0, 0, 0)
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 12, 0, 0, 0)
}

export function getActiveDateKeys(
  completedDueDates: Date[],
  frozenDates: string[] = []
): Set<string> {
  const keys = new Set<string>()
  for (const dueAt of completedDueDates) {
    keys.add(toDateKey(dueAt))
  }
  for (const d of frozenDates) {
    keys.add(d)
  }
  return keys
}

export function computeCurrentStreak(
  activeDateKeys: Set<string>,
  today = new Date()
): number {
  const todayKey = toDateKey(today)
  let cursor = activeDateKeys.has(todayKey) ? today : addDays(today, -1)

  if (!activeDateKeys.has(toDateKey(cursor))) {
    return 0
  }

  let streak = 0
  while (activeDateKeys.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function longestStreakInRange(
  activeDateKeys: Set<string>,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const startKey = toDateKey(rangeStart)
  const endKey = toDateKey(rangeEnd)
  const sorted = Array.from(activeDateKeys)
    .filter((key) => key >= startKey && key <= endKey)
    .sort()

  if (sorted.length === 0) return 0

  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDateKey(sorted[i - 1])
    if (toDateKey(addDays(prev, 1)) === sorted[i]) {
      run += 1
    } else {
      longest = Math.max(longest, run)
      run = 1
    }
  }

  return Math.max(longest, run)
}

export function activeDaysInMonth(
  activeDateKeys: Set<string>,
  year: number,
  month: number,
  today = new Date()
): number[] {
  const lastDay = endOfMonth(year, month).getDate()
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month
  const isFutureMonth =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())
  const maxDay = isFutureMonth ? 0 : isCurrentMonth ? today.getDate() : lastDay

  const days: number[] = []
  for (let day = 1; day <= maxDay; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (activeDateKeys.has(key)) days.push(day)
  }

  return days
}

export function buildStreakSummary(
  completedDueDates: Date[],
  year: number,
  month: number,
  userLevel: number,
  today = new Date(),
  frozenDates: string[] = []
) {
  const activeDateKeys = getActiveDateKeys(completedDueDates, frozenDates)
  const monthStart = startOfMonth(year, month)
  const monthEnd = endOfMonth(year, month)
  const activeDays = activeDaysInMonth(activeDateKeys, year, month, today)
  const currentStreak = computeCurrentStreak(activeDateKeys, today)

  return {
    currentStreak,
    goalDays: STREAK_GOAL_DAYS,
    activeDays,
    monthActiveDays: activeDays.length,
    monthLongestStreak: longestStreakInRange(
      activeDateKeys,
      monthStart,
      monthEnd
    ),
    themeObjectives: THEME_UNLOCK_OBJECTIVES.map((objective) => ({
      ...('level' in objective
        ? {
            level: objective.level,
            themeId: objective.themeId,
            unlocked: userLevel >= objective.level,
          }
        : {
            streakDays: objective.streakDays,
            themeId: objective.themeId,
            unlocked: currentStreak >= objective.streakDays,
          }),
    })),
  }
}
