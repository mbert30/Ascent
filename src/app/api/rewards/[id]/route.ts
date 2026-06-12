import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rewardUpdateSchema } from '@/lib/validation/reward'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const parsed = rewardUpdateSchema.safeParse(await request.json())

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.success ? null : parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const existing = await prisma.reward.findUnique({
      where: { id },
      select: { id: true, creatorId: true },
    })

    if (!existing || existing.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const reward = await prisma.reward.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        title: true,
        cost: true,
        icon: true,
        type: true,
        creatorId: true,
      },
    })

    return NextResponse.json(reward)
  } catch (error) {
    console.error('Reward PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const existing = await prisma.reward.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        _count: {
          select: { usersUnlocked: true },
        },
      },
    })

    if (!existing || existing.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (existing._count.usersUnlocked > 0) {
      return NextResponse.json({ error: 'HAS_REDEMPTIONS' }, { status: 400 })
    }

    await prisma.reward.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reward DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
