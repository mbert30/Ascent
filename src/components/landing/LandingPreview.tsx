'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { motion, useInView } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

import { burstConfetti } from '@/components/juice/ConfettiBurst'
import {
  BurningFlame,
  SparkleStar,
} from '@/components/landing/InteractiveMarketing'
import {
  LandingReveal,
  LandingSectionHeader,
} from '@/components/landing/LandingReveal'
import { marketingCardClass } from '@/components/landing/marketing-styles'

import { cn } from '@/lib/utils'

type PreviewDemoProps = {
  levelLabel: string
  todayLabel: string
  missionDoneLabel: string
  missionTodoLabel: string
  dailyQuestLabel: string
  dailyQuestAlmostLabel: string
}

function PreviewDemo({
  levelLabel,
  todayLabel,
  missionDoneLabel,
  missionTodoLabel,
  dailyQuestLabel,
  dailyQuestAlmostLabel,
}: PreviewDemoProps) {
  const [todoDone, setTodoDone] = useState(false)
  const [showXp, setShowXp] = useState(false)

  useEffect(() => {
    const completeTimer = setTimeout(() => {
      setTodoDone(true)
      setShowXp(true)

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (!reduced) {
        burstConfetti('indigo', 0.55, false)
      }
    }, 700)

    const xpTimer = setTimeout(() => setShowXp(false), 2200)

    return () => {
      clearTimeout(completeTimer)
      clearTimeout(xpTimer)
    }
  }, [])

  return (
    <PreviewCardBody
      levelLabel={levelLabel}
      todayLabel={todayLabel}
      missionDoneLabel={missionDoneLabel}
      missionTodoLabel={missionTodoLabel}
      dailyQuestLabel={dailyQuestLabel}
      dailyQuestAlmostLabel={dailyQuestAlmostLabel}
      todoDone={todoDone}
      showXp={showXp}
    />
  )
}

function PreviewCardBody({
  levelLabel,
  todayLabel,
  missionDoneLabel,
  missionTodoLabel,
  dailyQuestLabel,
  dailyQuestAlmostLabel,
  todoDone,
  showXp,
}: PreviewDemoProps & {
  todoDone: boolean
  showXp: boolean
}) {
  return (
    <>
      {showXp && (
        <motion.span
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-500/95 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-indigo-500/40"
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [8, -28, -48, -64],
            scale: [0.8, 1.05, 1, 0.9],
          }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <Sparkles className="size-3.5" aria-hidden />
          +15 XP
        </motion.span>
      )}

      <div className="rounded-[1.4rem] bg-black/40 p-4">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              7
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white">{levelLabel}</p>
              <p className="text-[10px] text-slate-400">240 / 400 XP</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-400">
              <SparkleStar />
              128
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <BurningFlame />
              12
            </span>
          </div>
        </div>

        <p className="mb-2 text-xs font-medium text-slate-400">{todayLabel}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="size-3.5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm text-white">{missionDoneLabel}</p>
              <p className="text-[10px] text-emerald-400">+25 XP</p>
            </div>
          </div>

          <motion.div
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
              todoDone
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-white/10 bg-white/5'
            )}
            animate={todoDone ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.35 }}
          >
            <div
              className={cn(
                'flex size-6 items-center justify-center rounded-full transition-colors',
                todoDone
                  ? 'bg-emerald-500/25 text-emerald-400'
                  : 'border border-white/20'
              )}
            >
              {todoDone && <Check className="size-3.5" aria-hidden />}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p
                className={cn(
                  'truncate text-sm',
                  todoDone ? 'text-white' : 'text-slate-200'
                )}
              >
                {missionTodoLabel}
              </p>
              <p
                className={cn(
                  'text-[10px]',
                  todoDone ? 'text-emerald-400' : 'text-slate-500'
                )}
              >
                +15 XP
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-center">
          <p className="text-xs font-medium text-indigo-200">
            {todoDone ? dailyQuestAlmostLabel : dailyQuestLabel}
          </p>
        </div>
      </div>
    </>
  )
}

export function LandingPreview() {
  const t = useTranslations('landing.preview')
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { once: false, amount: 0.55 })

  const labels = {
    levelLabel: t('level'),
    todayLabel: t('today'),
    missionDoneLabel: t('missionDone'),
    missionTodoLabel: t('missionTodo'),
    dailyQuestLabel: t('dailyQuest'),
    dailyQuestAlmostLabel: t('dailyQuestAlmost'),
  }

  return (
    <section className="border-t border-white/10 bg-slate-950/30 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('description')}
          </p>
        </LandingSectionHeader>

        <LandingReveal className="mx-auto mt-12 max-w-sm" delay={0.12}>
          <div
            ref={cardRef}
            className={cn(
              'relative overflow-hidden rounded-[2rem] border border-white/15 p-3 shadow-2xl shadow-black/50',
              marketingCardClass
            )}
            data-ascent-theme="dark"
          >
            {inView ? (
              <PreviewDemo key="demo" {...labels} />
            ) : (
              <PreviewCardBody {...labels} todoDone={false} showXp={false} />
            )}
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}
