'use client'

import { useTranslations } from 'next-intl'

import { Gift, Sparkles, Target } from 'lucide-react'

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

const SHOP_EXAMPLES = ['dinner', 'running', 'concert'] as const

const REWARD_CARDS = [
  {
    key: 'dailyQuest',
    icon: Target,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
  },
  {
    key: 'streak',
    icon: Sparkles,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    flame: true,
  },
  { key: 'shop', icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/15' },
] as const

export function LandingRewards() {
  const t = useTranslations('landing.rewards')
  const tShop = useTranslations('shop.examples')

  return (
    <section className="border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('description')}
          </p>
        </LandingSectionHeader>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {REWARD_CARDS.map(
            ({ key, icon: Icon, color, bg, ...rest }, index) => (
              <LandingReveal key={key} index={index}>
                <InteractiveCard className="h-full">
                  <article className={cn('h-full p-6', marketingCardClass)}>
                    <div className={cn('mb-4 inline-flex rounded-xl p-3', bg)}>
                      {'flame' in rest && rest.flame ? (
                        <BurningFlame sizeClassName="h-6 w-6" />
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
                    {key === 'dailyQuest' && (
                      <p className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-200">
                        {t('dailyQuest.bonus')}
                      </p>
                    )}
                    {key === 'shop' && (
                      <ul className="mt-4 space-y-2">
                        {SHOP_EXAMPLES.map((example) => (
                          <li
                            key={example}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-amber-500/30 hover:bg-amber-500/5"
                          >
                            {tShop(`${example}.title`)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </InteractiveCard>
              </LandingReveal>
            )
          )}
        </div>
      </div>
    </section>
  )
}
