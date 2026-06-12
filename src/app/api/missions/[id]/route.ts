import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { applyXpAndLevelUp, getLevelAndCurrencyFromXp } from '@/lib/levels'
import { prisma } from '@/lib/prisma'
import { updateMissionSchema } from '@/lib/validation/mission'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.mission.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateMissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.title != null) data.title = parsed.data.title
    if (parsed.data.category != null) data.category = parsed.data.category
    if (parsed.data.type != null) data.type = parsed.data.type
    if (parsed.data.xp != null) data.xp = parsed.data.xp
    if (parsed.data.dueAt != null) data.dueAt = new Date(parsed.data.dueAt)
    if (parsed.data.status != null) data.status = parsed.data.status

    const mission = await prisma.mission.update({
      where: { id },
      data,
    })

    let updatedUser: { level: number; xp: number; currency: number } | undefined
    if (parsed.data.status === 'COMPLETED') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, currency: true },
      })
      if (user) {
        const { xp, level, currency } = applyXpAndLevelUp(
          user.xp,
          user.level,
          user.currency,
          mission.xp
        )
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp, level, currency },
        })
        updatedUser = { level, xp, currency }
      }
    } else if (parsed.data.status === 'SCHEDULED') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, currency: true },
      })
      if (user) {
        const newXp = Math.max(0, user.xp - mission.xp)
        const { level, currency } = getLevelAndCurrencyFromXp(newXp)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp: newXp, level, currency },
        })
        updatedUser = { level, xp: newXp, currency }
      }
    }

    return NextResponse.json({
      id: mission.id,
      title: mission.title,
      category: mission.category,
      type: mission.type,
      xp: mission.xp,
      dueAt: mission.dueAt.toISOString(),
      status: mission.status,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Mission PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.mission.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    await prisma.mission.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Mission DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
