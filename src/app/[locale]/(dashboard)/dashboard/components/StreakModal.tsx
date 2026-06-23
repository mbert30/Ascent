'use client'

import { useEffect, useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Share2,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import { toBcp47Locale } from '@/lib/locale'
import { cn } from '@/lib/utils'

type StreakData = {
  currentStreak: number
  goalDays: number
  activeDays: number[]
  monthActiveDays: number
  monthLongestStreak: number
  userLevel: number
  bonusPercent: number
  completedWeeks: number
  daysToNextBonus: number
  nextBonusPercent: number
  streakFreeze: number
  canUseFreeze: boolean
  frozenDates: string[]
}

type StreakModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStreakChange?: (streak: number) => void
  onBonusChange?: (bonusPercent: number) => void
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function StreakModal({
  open,
  onOpenChange,
  onStreakChange,
  onBonusChange,
}: StreakModalProps) {
  const t = useTranslations('dashboard.streakModal')
  const locale = useLocale()
  const weekdayLabels = useMemo(
    () => WEEKDAY_KEYS.map((key) => t(`weekdays.${key}`)),
    [t]
  )
  const [viewDate, setViewDate] = useState(() => new Date())
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(false)
  const [usingFreeze, setUsingFreeze] = useState(false)

  const loadStreak = () => {
    setLoading(true)
    return fetch(
      `/api/streak?year=${viewDate.getFullYear()}&month=${viewDate.getMonth()}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StreakData | null) => {
        if (!data) return
        setStreakData(data)
        onStreakChange?.(data.currentStreak)
        onBonusChange?.(data.bonusPercent ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open) return

    void loadStreak()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewDate])

  const handleUseFreeze = async () => {
    setUsingFreeze(true)
    try {
      const res = await fetch('/api/streak/freeze', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setStreakData((prev) =>
          prev
            ? {
                ...prev,
                currentStreak: data.currentStreak,
                streakFreeze: data.streakFreeze,
                canUseFreeze: data.canUseFreeze,
                frozenDates: data.frozenDates,
                bonusPercent: data.bonusPercent ?? 0,
              }
            : prev
        )
        onStreakChange?.(data.currentStreak)
        onBonusChange?.(data.bonusPercent ?? 0)
      }
    } finally {
      setUsingFreeze(false)
    }
  }

  const {
    monthLabel,
    days,
    startOffset,
    totalActiveDays,
    longestStreakInMonth,
  } = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const lastDay = last.getDate()
    const startOffset = (first.getDay() + 6) % 7
    const monthLabel = viewDate.toLocaleDateString(toBcp47Locale(locale), {
      month: 'long',
      year: 'numeric',
    })
    const today = new Date()
    const isViewingCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month
    const todayDate = today.getDate()
    const activeDaySet = new Set(streakData?.activeDays ?? [])
    const frozenSet = new Set(streakData?.frozenDates ?? [])

    const days: {
      day: number
      active: boolean
      frozen: boolean
      isToday: boolean
    }[] = []
    for (let d = 1; d <= lastDay; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isAfterToday = isViewingCurrentMonth && d > todayDate
      days.push({
        day: d,
        active: !isAfterToday && activeDaySet.has(d),
        frozen: !isAfterToday && frozenSet.has(key),
        isToday: isViewingCurrentMonth && todayDate === d,
      })
    }

    return {
      monthLabel,
      days,
      startOffset,
      totalActiveDays: streakData?.monthActiveDays ?? 0,
      longestStreakInMonth: streakData?.monthLongestStreak ?? 0,
    }
  }, [viewDate, streakData, locale])

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }

  const currentStreak = streakData?.currentStreak ?? 0
  const goalDays = streakData?.goalDays ?? 7
  const progressPercent = Math.min(100, (currentStreak / goalDays) * 100)
  const bonusPercent = streakData?.bonusPercent ?? 0
  const weekProgress =
    currentStreak === 0 ? 0 : Math.round(((currentStreak % 7) / 7) * 100) || 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-onboarding="streak-modal"
        showCloseButton={false}
        className="flex max-h-[90dvh] flex-col overflow-hidden border-white/20 bg-slate-900/98 p-0 text-white backdrop-blur-xl sm:max-w-md"
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-white/10 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {}}
          >
            <Share2 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{t('share')}</span>
          </Button>
          <DialogTitle className="sr-only">
            {t('streakTitle', { count: currentStreak })}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="levels-dialog-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-4 pb-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Flame className="h-8 w-8 animate-pulse text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-white">
                {loading
                  ? t('loading')
                  : t('streakTitle', { count: currentStreak })}
              </p>
              {bonusPercent > 0 && (
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-amber-300">
                  <Zap className="h-4 w-4 shrink-0" />
                  {t('bonusActive', { percent: bonusPercent })}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrevMonth}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-white capitalize">
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={goNextMonth}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdayLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-[0.65rem] font-medium text-white/50 uppercase"
                >
                  {label}
                </span>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {days.map(({ day, active, frozen, isToday }) => (
                <span
                  key={day}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm',
                    active &&
                      'bg-gradient-to-br from-orange-500 to-amber-500 font-semibold text-white',
                    frozen &&
                      !active &&
                      'bg-gradient-to-br from-cyan-500/80 to-blue-500/80 font-semibold text-white ring-1 ring-cyan-300/50',
                    !active && !frozen && 'text-white/60',
                    isToday &&
                      !active &&
                      !frozen &&
                      'ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-900'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-orange-600/15 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {t('bonusTitle')}
              </p>
              <p className="mt-1 text-lg font-bold text-amber-100">
                {bonusPercent > 0
                  ? t('bonusPercent', { percent: bonusPercent })
                  : t('bonusNone')}
              </p>
              <p className="mt-1 text-[0.65rem] text-white/60">
                {t('bonusRule')}
              </p>
              <Progress
                value={weekProgress}
                className="mt-2 h-1.5 bg-white/10"
              />
            </div>
            <div className="space-y-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Shield className="h-3.5 w-3.5 text-cyan-300" />
                  {t('freezeTitle')}
                </p>
                <span className="rounded-lg bg-cyan-500/20 px-2 py-0.5 text-sm font-bold text-cyan-100">
                  {streakData?.streakFreeze ?? 0}
                </span>
              </div>
              <p className="text-[0.65rem] text-white/60">
                {t('freezeDescription')}
              </p>
              {streakData?.canUseFreeze && (
                <Button
                  type="button"
                  size="sm"
                  disabled={usingFreeze}
                  onClick={handleUseFreeze}
                  className="h-8 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs text-white hover:opacity-95"
                >
                  {usingFreeze ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t('freezeUse')
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-3 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-orange-400/20 blur-md" />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.65rem] font-medium tracking-wider text-white/60 uppercase">
                    {t('monthLongestStreak')}
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {longestStreakInMonth}
                    <span className="ml-1.5 text-xs font-medium text-white/70">
                      {t('daysUnit')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-yellow-500/10 p-3 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
              <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-amber-400/20 blur-md" />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <CalendarDays className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.65rem] font-medium tracking-wider text-white/60 uppercase">
                    {t('monthActiveDays')}
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {totalActiveDays}
                    <span className="ml-1.5 text-xs font-medium text-white/70">
                      {t('daysUnit')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-white/5 p-3">
            <p className="text-xs font-semibold text-white">{t('goalTitle')}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[0.65rem] text-white/70">
                <span>
                  {t('goalProgress', {
                    current: currentStreak,
                    target: goalDays,
                  })}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/10" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
