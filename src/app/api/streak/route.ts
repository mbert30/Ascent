import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildStreakSummary } from '@/lib/streak'
import { getUserStreakContext, parseFrozenDates } from '@/lib/streak-user'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const now = new Date()
    const year = Number(searchParams.get('year') ?? now.getFullYear())
    const month = Number(searchParams.get('month') ?? now.getMonth())

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 0 ||
      month > 11
    ) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { level: true, frozenStreakDates: true, streakFreeze: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const frozenDates = parseFrozenDates(user.frozenStreakDates)
    const streakCtx = await getUserStreakContext(prisma, session.user.id, now)

    const monthStart = new Date(year, month, 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
    const historyStart = new Date(now)
    historyStart.setDate(historyStart.getDate() - 120)
    historyStart.setHours(0, 0, 0, 0)

    const completedMissions = await prisma.mission.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        dueAt: { gte: historyStart, lte: monthEnd },
      },
      select: { dueAt: true },
    })

    const allDueDates = completedMissions.map((mission) => mission.dueAt)
    const monthDueDates = allDueDates.filter(
      (dueAt) => dueAt >= monthStart && dueAt <= monthEnd
    )

    const summary = buildStreakSummary(
      allDueDates,
      year,
      month,
      user.level,
      now,
      frozenDates
    )
    const monthSummary = buildStreakSummary(
      monthDueDates,
      year,
      month,
      user.level,
      now,
      frozenDates
    )

    return NextResponse.json({
      currentStreak: streakCtx.currentStreak,
      goalDays: summary.goalDays,
      activeDays: monthSummary.activeDays,
      monthActiveDays: monthSummary.monthActiveDays,
      monthLongestStreak: monthSummary.monthLongestStreak,
      themeObjectives: summary.themeObjectives,
      userLevel: user.level,
      year,
      month,
      multiplier: streakCtx.multiplier,
      bonusPercent: streakCtx.bonusPercent,
      completedWeeks: streakCtx.completedWeeks,
      daysToNextBonus: streakCtx.daysToNextBonus,
      nextBonusPercent: streakCtx.nextBonusPercent,
      streakFreeze: streakCtx.streakFreeze,
      canUseFreeze: streakCtx.canUseFreeze,
      frozenDates: streakCtx.frozenDates,
    })
  } catch (error) {
    console.error('Streak GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
