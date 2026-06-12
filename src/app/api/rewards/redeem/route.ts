import { NextRequest, NextResponse } from 'next/server'

import { RewardType } from '@prisma/client'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const redeemSchema = z.object({
  rewardId: z.string().cuid().optional(),
  title: z.string().min(1).max(80).optional(),
  cost: z.number().int().min(0).max(5000).optional(),
  icon: z.string().max(20).nullable().optional(),
  type: z.nativeEnum(RewardType).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = redeemSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data
    let rewardId = input.rewardId

    if (!rewardId) {
      if (!input.title || input.cost == null) {
        return NextResponse.json(
          { error: 'Missing reward identifier' },
          { status: 400 }
        )
      }
      const created = await prisma.reward.create({
        data: {
          title: input.title,
          cost: input.cost,
          icon: input.icon ?? null,
          type: input.type ?? RewardType.REAL_LIFE,
          creatorId: session.user.id,
        },
        select: { id: true },
      })
      rewardId = created.id
    }

    const result = await prisma.$transaction(async (tx) => {
      const [user, reward] = await Promise.all([
        tx.user.findUnique({
          where: { id: session.user.id },
          select: { currency: true },
        }),
        tx.reward.findUnique({
          where: { id: rewardId },
          select: { id: true, title: true, cost: true, icon: true, type: true },
        }),
      ])

      if (!user || !reward) return null
      if (user.currency < reward.cost)
        return { error: 'INSUFFICIENT_GOLD' as const }

      const [updatedUser] = await Promise.all([
        tx.user.update({
          where: { id: session.user.id },
          data: { currency: { decrement: reward.cost } },
          select: { currency: true },
        }),
        tx.userReward.create({
          data: {
            userId: session.user.id,
            rewardId: reward.id,
          },
        }),
      ])

      return { reward, balance: updatedUser.currency }
    })

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Rewards redeem error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
