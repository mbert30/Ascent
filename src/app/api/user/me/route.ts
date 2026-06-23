import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getThemeState, setActiveTheme } from '@/lib/themes/service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        level: true,
        xp: true,
        currency: true,
        onboardingCompletedAt: true,
        isPremium: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const themeState = await getThemeState(prisma, session.user.id)

    return NextResponse.json({
      email: user.email,
      themeId: themeState.themeId,
      unlockedThemeIds: themeState.unlockedThemeIds,
      level: user.level,
      xp: user.xp,
      currency: user.currency,
      onboardingCompleted: user.onboardingCompletedAt != null,
      isPremium: user.isPremium,
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
    const themeId =
      body.themeId === undefined
        ? undefined
        : typeof body.themeId === 'string'
          ? body.themeId
          : undefined

    const markOnboardingComplete = body.onboardingCompleted === true

    if (themeId === undefined && !markOnboardingComplete) {
      return NextResponse.json(
        { error: 'Invalid body: themeId must be a string' },
        { status: 400 }
      )
    }

    if (themeId !== undefined) {
      const result = await setActiveTheme(prisma, session.user.id, themeId)
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    if (markOnboardingComplete) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingCompletedAt: new Date() },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('User me PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
