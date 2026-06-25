'use client'

import { useTranslations } from 'next-intl'

import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react'

import {
  BurningFlame,
  GlowIcon,
  InteractiveCard,
  PulseZap,
} from '@/components/landing/InteractiveMarketing'
import {
  LandingReveal,
  LandingSectionHeader,
} from '@/components/landing/LandingReveal'
import { marketingCardClass } from '@/components/landing/marketing-styles'

import { cn } from '@/lib/utils'

const FEATURES = [
  {
    key: 'setGoals',
    icon: Target,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
  },
  {
    key: 'earnXP',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    zap: true,
  },
  {
    key: 'trackStreaks',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    flame: true,
  },
  {
    key: 'visualize',
    icon: Sparkles,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
  },
] as const

export function LandingFeatures() {
  const t = useTranslations('landing.features')

  return (
    <section
      id="features"
      className="border-t border-white/10 bg-slate-950/40 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('description')}
          </p>
        </LandingSectionHeader>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {FEATURES.map(({ key, icon: Icon, color, bg, ...rest }, index) => (
            <LandingReveal key={key} index={index}>
              <InteractiveCard className="h-full">
                <div className={cn('h-full p-6', marketingCardClass)}>
                  <div className={cn('mb-4 inline-flex rounded-xl p-3', bg)}>
                    {'zap' in rest && rest.zap ? (
                      <PulseZap sizeClassName="h-7 w-7" />
                    ) : 'flame' in rest && rest.flame ? (
                      <BurningFlame sizeClassName="h-7 w-7" />
                    ) : (
                      <GlowIcon
                        icon={Icon}
                        iconClassName={cn('h-7 w-7', color)}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {t(`${key}.description`)}
                  </p>
                </div>
              </InteractiveCard>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
