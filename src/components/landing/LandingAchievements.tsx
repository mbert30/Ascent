'use client'

import { useTranslations } from 'next-intl'

import { Flame, Star, Target, Trophy } from 'lucide-react'

import {
  BurningFlame,
  GlowIcon,
  InteractiveCard,
  SparkleStar,
} from '@/components/landing/InteractiveMarketing'
import {
  LandingReveal,
  LandingSectionHeader,
} from '@/components/landing/LandingReveal'

import { cn } from '@/lib/utils'

const TIERS = [
  {
    key: 'bronze',
    accent: 'text-amber-400',
    bar: 'from-amber-500 to-amber-700',
    surface: 'from-amber-950/90 via-slate-950/95 to-slate-950',
    border: 'border-amber-500/35',
    iconBg: 'bg-amber-500/15 ring-amber-500/30',
  },
  {
    key: 'gold',
    accent: 'text-yellow-300',
    bar: 'from-yellow-400 to-amber-600',
    surface: 'from-yellow-950/80 via-slate-950/95 to-slate-950',
    border: 'border-yellow-500/35',
    iconBg: 'bg-yellow-500/15 ring-yellow-500/30',
  },
  {
    key: 'diamond',
    accent: 'text-cyan-300',
    bar: 'from-cyan-400 to-blue-600',
    surface: 'from-cyan-950/80 via-slate-950/95 to-slate-950',
    border: 'border-cyan-400/35',
    iconBg: 'bg-cyan-500/15 ring-cyan-400/30',
  },
  {
    key: 'ruby',
    accent: 'text-rose-300',
    bar: 'from-rose-500 to-red-700',
    surface: 'from-rose-950/80 via-slate-950/95 to-slate-950',
    border: 'border-rose-500/35',
    iconBg: 'bg-rose-500/15 ring-rose-500/30',
  },
] as const

const SAMPLE_ACHIEVEMENTS = [
  { id: 'streakMaster', icon: Flame, flame: true },
  { id: 'missionHunter', icon: Target },
  { id: 'risingStar', icon: Star, star: true },
] as const

export function LandingAchievements() {
  const t = useTranslations('landing.achievements')
  const tFrames = useTranslations('achievements.frames')
  const tAch = useTranslations('achievements')

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

        <div className="mt-12 grid grid-cols-2 items-start gap-3 sm:grid-cols-4 sm:gap-4">
          {TIERS.map((tier, index) => (
            <LandingReveal key={tier.key} index={index} className="w-full">
              <InteractiveCard className="w-full">
                <article
                  className={cn(
                    'relative overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-lg shadow-black/30 sm:p-5',
                    tier.border,
                    tier.surface
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                      tier.bar
                    )}
                  />
                  <div
                    className={cn(
                      'mb-3 flex size-11 items-center justify-center rounded-xl ring-1 sm:mb-4 sm:size-12',
                      tier.iconBg
                    )}
                  >
                    <GlowIcon
                      icon={Trophy}
                      iconClassName={cn('size-5 sm:size-6', tier.accent)}
                    />
                  </div>
                  <p
                    className={cn(
                      'text-sm font-bold sm:text-base',
                      tier.accent
                    )}
                  >
                    {tFrames(tier.key)}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-400">
                    {t(`tiers.${tier.key}`)}
                  </p>
                </article>
              </InteractiveCard>
            </LandingReveal>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {SAMPLE_ACHIEVEMENTS.map(({ id, icon: Icon, ...rest }, index) => (
            <LandingReveal
              key={id}
              index={index}
              delay={0.05}
              className="w-full"
            >
              <InteractiveCard className="w-full">
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                    {'flame' in rest && rest.flame ? (
                      <BurningFlame sizeClassName="size-4" />
                    ) : 'star' in rest && rest.star ? (
                      <SparkleStar sizeClassName="size-4" />
                    ) : (
                      <GlowIcon
                        icon={Icon}
                        iconClassName="size-4 text-indigo-300"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {tAch(`${id}.name`)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {tAch(`${id}.description`)}
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LandingReveal>
          ))}
        </div>

        <LandingReveal className="mt-6 text-center" delay={0.1}>
          <p className="text-sm text-slate-500">{t('footnote')}</p>
        </LandingReveal>
      </div>
    </section>
  )
}
