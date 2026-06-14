import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'
import { z } from 'zod'

import { sendVerificationEmail } from '@/lib/email'
import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { ensureDefaultTheme } from '@/lib/themes/service'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  locale: z.enum(['en', 'fr']).default('en'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password, locale } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_ALREADY_EXISTS' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        level: 1,
        xp: 0,
        currency: 0,
        verificationToken,
      },
      select: {
        id: true,
        email: true,
      },
    })

    await ensureDefaultTheme(prisma, user.id)

    // Envoi de l'email de vérification — ne bloque pas l'inscription si ça échoue
    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
      const verificationLink = `${baseUrl}/${locale}/verify-email?token=${verificationToken}`
      await sendVerificationEmail({ to: email, verificationLink, locale })
    } catch (emailError) {
      console.error('Verification email failed to send:', emailError)
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
