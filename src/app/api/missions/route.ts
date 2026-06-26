import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  ensureRolledOverOneOffs,
  newRepeatKey,
} from '@/lib/missions/recurrence'
import { prisma } from '@/lib/prisma'
import { createMissionSchema } from '@/lib/validation/mission'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') // YYYY-MM-DD, default today
    const start = dateStr
      ? new Date(dateStr + 'T00:00:00.000Z')
      : new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)

    const todayUtc = new Date().toISOString().slice(0, 10)
    const requestedDate = dateStr ?? todayUtc
    if (requestedDate === todayUtc) {
      await ensureRolledOverOneOffs(prisma, session.user.id)
    }

    const missions = await prisma.mission.findMany({
      where: {
        userId: session.user.id,
        dueAt: { gte: start, lt: end },
      },
      orderBy: { dueAt: 'asc' },
    })

    return NextResponse.json(
      missions.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        type: m.type,
        xp: m.xp,
        dueAt: m.dueAt.toISOString(),
        status: m.status,
        repeatKey: m.repeatKey,
      }))
    )
  } catch (error) {
    console.error('Missions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createMissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const { title, category, type, xp, dueAt, repeat, repeatCount } =
      parsed.data
    const baseDueAt = new Date(dueAt)
    const repeatMode = repeat ?? 'NONE'
    const occurrences = repeatMode === 'NONE' ? 1 : (repeatCount ?? 14)
    const repeatKey = repeatMode === 'NONE' ? null : newRepeatKey()

    const created = await prisma.$transaction(
      Array.from({ length: occurrences }).map((_, index) => {
        const due = new Date(baseDueAt)
        if (repeatMode === 'DAILY') {
          due.setDate(due.getDate() + index)
        } else if (repeatMode === 'WEEKLY') {
          due.setDate(due.getDate() + index * 7)
        }
        return prisma.mission.create({
          data: {
            userId,
            title,
            category,
            type,
            xp,
            dueAt: due,
            status: 'SCHEDULED',
            repeatKey,
          },
        })
      })
    )

    const first = created[0]
    return NextResponse.json(
      {
        id: first.id,
        title: first.title,
        category: first.category,
        type: first.type,
        xp: first.xp,
        dueAt: first.dueAt.toISOString(),
        status: first.status,
        createdCount: created.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Missions POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
