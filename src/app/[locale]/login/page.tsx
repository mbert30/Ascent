'use client'

import { Suspense } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { AuthForm } from '@/components/auth/AuthForm'
import { AscentLogo } from '@/components/landing/AscentLogo'
import { LocaleSwitcher } from '@/components/landing/LocaleSwitcher'
import { MarketingShell } from '@/components/landing/MarketingShell'
import { gradientBtnClass } from '@/components/landing/marketing-styles'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function LoginContent() {
  const t = useTranslations()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  return (
    <MarketingShell fixedViewport>
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <LocaleSwitcher />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
        <div className="mb-8">
          <AscentLogo size="lg" href={`/${locale}`} surface="dark" />
        </div>

        <div className="w-full max-w-md">
          <Card className="border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-md">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-2xl font-bold text-white">
                {t('auth.welcome')}
              </CardTitle>
              <CardDescription className="text-center text-slate-400">
                {t('auth.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm
                defaultTab={tab}
                primaryBtnClass={gradientBtnClass}
                variant="dark"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
