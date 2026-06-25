'use client'

import { useTranslations } from 'next-intl'

import { CheckCircle2, Coins, Flame } from 'lucide-react'

import {
  BurningFlame,
  GlowIcon,
  InteractiveCard,
} from '@/components/landing/InteractiveMarketing'
import {
  LandingReveal,
  LandingSectionHeader,
} from '@/components/landing/LandingReveal'
import { marketingCardClass } from '@/components/landing/marketing-styles'

import { cn } from '@/lib/utils'

const STEPS = [
  {
    key: 'missions',
    icon: CheckCircle2,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
  },
  {
    key: 'progress',
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    flame: true,
  },
  {
    key: 'rewards',
    icon: Coins,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
] as const

export function LandingLoop() {
  const t = useTranslations('landing.loop')

  return (
    <section
      id="loop"
      className="border-t border-white/10 bg-slate-950/40 px-5 py-16 sm:px-8 sm:py-20"
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

        <ol className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ key, icon: Icon, color, bg, ...rest }, index) => (
            <LandingReveal key={key} index={index}>
              <InteractiveCard>
                <li className={cn('relative p-6', marketingCardClass)}>
                  <span className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className={cn('mb-4 inline-flex rounded-xl p-3', bg)}>
                    {'flame' in rest && rest.flame ? (
                      <BurningFlame sizeClassName="h-6 w-6" showEmbers />
                    ) : (
                      <GlowIcon
                        icon={Icon}
                        iconClassName={cn('h-6 w-6', color)}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {t(`${key}.description`)}
                  </p>
                </li>
              </InteractiveCard>
            </LandingReveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
