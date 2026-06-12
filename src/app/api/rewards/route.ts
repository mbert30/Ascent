import { NextRequest, NextResponse } from 'next/server'

import { RewardType } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rewardCreateSchema } from '@/lib/validation/reward'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user, customRewards, history] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { currency: true },
      }),
      prisma.reward.findMany({
        where: {
          OR: [{ creatorId: session.user.id }, { creatorId: null }],
        },
        orderBy: [{ creatorId: 'asc' }, { cost: 'asc' }],
        select: {
          id: true,
          title: true,
          cost: true,
          icon: true,
          type: true,
          creatorId: true,
        },
      }),
      prisma.userReward.findMany({
        where: { userId: session.user.id },
        orderBy: { purchasedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          purchasedAt: true,
          reward: {
            select: {
              title: true,
              cost: true,
              icon: true,
              type: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      balance: user?.currency ?? 0,
      rewards: customRewards.map((reward) => ({
        ...reward,
        isEditable: reward.creatorId === session.user.id,
      })),
      history: history.map((item) => ({
        id: item.id,
        purchasedAt: item.purchasedAt.toISOString(),
        title: item.reward.title,
        cost: item.reward.cost,
        icon: item.reward.icon,
        type: item.reward.type,
      })),
    })
  } catch (error) {
    console.error('Rewards GET error:', error)
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
    const parsed = rewardCreateSchema.safeParse({
      ...body,
      creatorId: session.user.id,
      type: body.type ?? RewardType.REAL_LIFE,
      icon: body.icon ?? null,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const reward = await prisma.reward.create({
      data: parsed.data,
      select: { id: true, title: true, cost: true, icon: true, type: true },
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Rewards POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
