import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { missionTemplatesForDate } from '@/lib/missions/templates'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )
    const todayEnd = new Date(todayStart)
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

    const existingCount = await prisma.mission.count({
      where: {
        userId: session.user.id,
        dueAt: { gte: todayStart, lt: todayEnd },
      },
    })

    if (existingCount > 0) {
      return NextResponse.json({ created: 0, skipped: true })
    }

    const templates = missionTemplatesForDate()
    await prisma.mission.createMany({
      data: templates.map((mission) => {
        const dueAt = new Date(now)
        dueAt.setHours(mission.hour, 0, 0, 0)
        return {
          userId: session.user.id,
          title: mission.title,
          category: mission.category,
          type: mission.type,
          xp: mission.xp,
          dueAt,
          status: 'SCHEDULED' as const,
        }
      }),
    })

    return NextResponse.json({ created: templates.length, skipped: false })
  } catch (error) {
    console.error('Starter template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
