import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

import { verifyPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { ensureDefaultTheme } from '@/lib/themes/service'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/en/login',
    error: '/en/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id!
        const dbUser = await prisma.user.findUnique({ where: { id: user.id! } })
        token.isPremium = dbUser?.isPremium ?? false
      }
      if (account?.provider === 'google' && profile?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        })

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              level: 1,
              xp: 0,
              currency: 0,
            },
          })
          await ensureDefaultTheme(prisma, dbUser.id)
        }
        token.id = dbUser.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isPremium = token.isPremium as boolean
      }
      return session
    },
  },
})
