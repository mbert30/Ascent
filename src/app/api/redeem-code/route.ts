import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { grantDemoUnlocks } from '@/lib/demo/grant-unlocks'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const demoCode = process.env.DEMO_CHEAT_CODE
    if (!demoCode) {
      return NextResponse.json({ error: 'unavailable' }, { status: 503 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!code) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    if (code !== demoCode) {
      return NextResponse.json({ error: 'invalid' }, { status: 403 })
    }

    const result = await grantDemoUnlocks(prisma, session.user.id)

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Redeem code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
