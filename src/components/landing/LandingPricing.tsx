'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { Check, Crown, Sparkles } from 'lucide-react'

import { InteractiveCard } from '@/components/landing/InteractiveMarketing'
import {
  LandingReveal,
  LandingSectionHeader,
} from '@/components/landing/LandingReveal'
import {
  gradientBtnClass,
  marketingOutlineBtnClass,
} from '@/components/landing/marketing-styles'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function LandingPricing() {
  const t = useTranslations('landing.pricing')
  const locale = useLocale()

  const freePerks = ['perk1', 'perk2', 'perk3'] as const
  const premiumPerks = ['perk1', 'perk2', 'perk3'] as const

  return (
    <section className="border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <LandingSectionHeader className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('description')}
          </p>
        </LandingSectionHeader>

        <div className="mt-12 grid items-stretch gap-5 md:grid-cols-2 md:gap-6">
          <LandingReveal index={0} className="h-full">
            <InteractiveCard className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/25 backdrop-blur-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10">
                    <Sparkles className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {t('free.label')}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-white">
                      {t('free.price')}
                    </p>
                  </div>
                </div>

                <ul className="mt-8 flex-1 space-y-3.5">
                  {freePerks.map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check
                          className="size-3 text-emerald-400"
                          aria-hidden
                        />
                      </span>
                      {t(`free.${key}`)}
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className={cn('mt-8 h-12', marketingOutlineBtnClass)}
                >
                  <Link href={`/${locale}/login?tab=signup`}>
                    {t('free.cta')}
                  </Link>
                </Button>
              </article>
            </InteractiveCard>
          </LandingReveal>

          <LandingReveal index={1} className="h-full">
            <InteractiveCard className="h-full">
              <div className="h-full rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-px shadow-xl shadow-purple-900/30">
                <article className="relative flex h-full flex-col rounded-[calc(1rem-1px)] bg-slate-950/95 p-6 sm:p-8">
                  <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    {t('premium.badge')}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-200 ring-1 ring-indigo-400/30">
                      <Crown className="size-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-300">
                        {t('premium.label')}
                      </p>
                      <p className="text-3xl font-bold tracking-tight text-white">
                        {t('premium.price')}
                        <span className="ml-1.5 text-sm font-normal text-slate-400">
                          {t('premium.priceNote')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {premiumPerks.map((key) => (
                      <li
                        key={key}
                        className="flex items-start gap-3 text-sm text-slate-200"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                          <Check
                            className="size-3 text-indigo-300"
                            aria-hidden
                          />
                        </span>
                        {t(`premium.${key}`)}
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    asChild
                    className={cn('mt-8 h-12', gradientBtnClass)}
                  >
                    <Link href={`/${locale}/login?tab=signup`}>
                      {t('premium.cta')}
                    </Link>
                  </Button>
                </article>
              </div>
            </InteractiveCard>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
