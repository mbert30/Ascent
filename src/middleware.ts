import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_ROUTES = [
  '/dashboard',
  '/goals',
  '/settings',
  '/achievements',
  '/shop',
]
const AUTH_ONLY_ROUTES = ['reset-password']
const PUBLIC_AUTH_PATHS = ['en', 'fr']

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl
  const session = req.auth
  const locale = pathname.split('/')[1] || 'en'

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.includes(route))
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.includes(route)
  )
  const isLoginPage =
    PUBLIC_AUTH_PATHS.includes(pathname.split('/')[1]) &&
    pathname.split('/').length === 2

  // Vérifier session?.user?.id (req.auth peut être {} sans user en Edge)
  const isAuthenticated = Boolean(session?.user?.id)

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}`, req.url)
    return NextResponse.redirect(loginUrl)
  }

  if ((isLoginPage || isAuthOnlyRoute) && isAuthenticated) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  const response = intlMiddleware(req as NextRequest)
  return response
})

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
}
