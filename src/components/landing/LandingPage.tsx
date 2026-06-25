'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { LandingAchievements } from '@/components/landing/LandingAchievements'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingLoop } from '@/components/landing/LandingLoop'
import { LandingPreview } from '@/components/landing/LandingPreview'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingRewards } from '@/components/landing/LandingRewards'
import { MarketingShell } from '@/components/landing/MarketingShell'
import { MobileStickyCTA } from '@/components/landing/MobileStickyCTA'
import { gradientBtnClass } from '@/components/landing/marketing-styles'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function LandingPage() {
  const t = useTranslations('landing.footer')
  const locale = useLocale()

  return (
    <MarketingShell>
      <LandingHeader />
      <main className="flex flex-1 flex-col">
        <LandingHero />
        <LandingLoop />
        <LandingPreview />
        <LandingRewards />
        <LandingAchievements />
        <LandingFeatures />
        <LandingPricing />

        <footer
          id="landing-footer"
          className="border-t border-white/10 bg-slate-950/60 px-5 py-12 sm:px-8"
        >
          <LandingReveal className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
            <p className="max-w-md text-sm text-slate-400">{t('tagline')}</p>
            <Button size="lg" asChild className={cn(gradientBtnClass)}>
              <Link href={`/${locale}/login?tab=signup`}>{t('cta')}</Link>
            </Button>
            <p className="text-xs text-slate-600">{t('copyright')}</p>
          </LandingReveal>
        </footer>
      </main>
      <MobileStickyCTA />
    </MarketingShell>
  )
}
