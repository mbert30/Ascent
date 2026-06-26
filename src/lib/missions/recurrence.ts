import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'

const HORIZON_DAYS = 14
const SPECIAL_CATEGORIES = [
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
]

function utcDayStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

function utcDayEnd(date: Date): Date {
  const end = utcDayStart(date)
  end.setUTCDate(end.getUTCDate() + 1)
  return end
}

export function newRepeatKey(): string {
  return randomUUID()
}

/** Assign repeatKey to legacy habit series that share title + category. */
async function backfillRepeatKeys(prisma: PrismaClient, userId: string) {
  const orphans = await prisma.mission.findMany({
    where: {
      userId,
      type: 'HABIT',
      repeatKey: null,
      category: { notIn: SPECIAL_CATEGORIES },
    },
    select: { id: true, title: true, category: true },
  })

  const groups = new Map<string, string[]>()
  for (const m of orphans) {
    const key = `${m.title}\0${m.category}`
    const ids = groups.get(key) ?? []
    ids.push(m.id)
    groups.set(key, ids)
  }

  for (const ids of groups.values()) {
    if (ids.length < 2) continue
    const repeatKey = newRepeatKey()
    await prisma.mission.updateMany({
      where: { id: { in: ids } },
      data: { repeatKey },
    })
  }
}

export async function ensureRolledOverOneOffs(
  prisma: PrismaClient,
  userId: string
) {
  const now = new Date()
  const todayStart = utcDayStart(now)

  const missed = await prisma.mission.findMany({
    where: {
      userId,
      repeatKey: null,
      status: 'SCHEDULED',
      dueAt: { lt: todayStart },
      category: { notIn: SPECIAL_CATEGORIES },
    },
    select: { id: true, dueAt: true },
  })

  for (const mission of missed) {
    const rolled = new Date(mission.dueAt)
    rolled.setUTCFullYear(
      todayStart.getUTCFullYear(),
      todayStart.getUTCMonth(),
      todayStart.getUTCDate()
    )
    await prisma.mission.update({
      where: { id: mission.id },
      data: { dueAt: rolled },
    })
  }
}

export async function ensureRecurringHabits(
  prisma: PrismaClient,
  userId: string
) {
  await backfillRepeatKeys(prisma, userId)

  const now = new Date()
  const horizonEnd = utcDayStart(now)
  horizonEnd.setUTCDate(horizonEnd.getUTCDate() + HORIZON_DAYS)

  const habits = await prisma.mission.findMany({
    where: {
      userId,
      type: 'HABIT',
      repeatKey: { not: null },
      category: { notIn: SPECIAL_CATEGORIES },
    },
    orderBy: { dueAt: 'asc' },
  })

  const byKey = new Map<string, typeof habits>()
  for (const m of habits) {
    if (!m.repeatKey) continue
    const list = byKey.get(m.repeatKey) ?? []
    list.push(m)
    byKey.set(m.repeatKey, list)
  }

  for (const group of byKey.values()) {
    const sample = group[0]
    const maxDue = group.reduce(
      (max, m) => (m.dueAt > max ? m.dueAt : max),
      group[0].dueAt
    )
    if (maxDue >= horizonEnd) continue

    const cursor = utcDayStart(maxDue)
    cursor.setUTCDate(cursor.getUTCDate() + 1)

    while (cursor <= horizonEnd) {
      const dayStart = cursor
      const dayEnd = utcDayEnd(cursor)
      const exists = group.some((m) => m.dueAt >= dayStart && m.dueAt < dayEnd)
      if (!exists) {
        const due = new Date(sample.dueAt)
        due.setUTCFullYear(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate()
        )
        const created = await prisma.mission.create({
          data: {
            userId,
            title: sample.title,
            category: sample.category,
            type: sample.type,
            xp: sample.xp,
            dueAt: due,
            status: 'SCHEDULED',
            repeatKey: sample.repeatKey,
          },
        })
        group.push(created)
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }
}

export function isRecurringHabit(mission: {
  type: string
  repeatKey?: string | null
  category: string
}): boolean {
  if (mission.type !== 'HABIT') return false
  if (SPECIAL_CATEGORIES.includes(mission.category)) return false
  return mission.repeatKey != null
}
