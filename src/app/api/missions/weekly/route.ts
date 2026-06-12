import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const day = now.getDay()
    const diffToMonday = (day + 6) % 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - diffToMonday)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const missions = await prisma.mission.findMany({
      where: {
        userId: session.user.id,
        dueAt: { gte: weekStart, lt: weekEnd },
      },
      select: { status: true, xp: true },
    })

    const completed = missions.filter((m) => m.status === 'COMPLETED')
    const totalXp = completed.reduce((sum, m) => sum + m.xp, 0)

    return NextResponse.json({
      completed: completed.length,
      scheduled: missions.length,
      totalXp,
    })
  } catch (error) {
    console.error('Weekly missions summary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
