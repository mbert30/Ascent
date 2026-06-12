import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        image: true,
        level: true,
        xp: true,
        currency: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      image: user.image,
      level: user.level,
      xp: user.xp,
      currency: user.currency,
    })
  } catch (error) {
    console.error('User me GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const image =
      body.image === undefined
        ? undefined
        : body.image === null || body.image === ''
          ? null
          : typeof body.image === 'string'
            ? body.image
            : undefined

    if (image === undefined) {
      return NextResponse.json(
        { error: 'Invalid body: image must be a string or null' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('User me PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
