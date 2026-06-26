'use client'

import { useEffect, useMemo, useState } from 'react'

import { useLocale } from 'next-intl'
import Link from 'next/link'

import { ArrowLeft, Sparkles, Target } from 'lucide-react'

import { DashboardShell } from '@/components/layout/DashboardShell'
import { Card, CardContent } from '@/components/ui/card'

type Mission = {
  id: string
  title: string
  type: 'HABIT' | 'GOAL'
  status: 'SCHEDULED' | 'COMPLETED'
  xp: number
}

export default function GoalsPage() {
  const locale = useLocale()
  const [missions, setMissions] = useState<Mission[]>([])

  useEffect(() => {
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    fetch(`/api/missions?date=${date}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMissions(data))
      .catch(() => setMissions([]))
  }, [])

  const habits = useMemo(
    () => missions.filter((m) => m.type === 'HABIT'),
    [missions]
  )
  const goals = useMemo(
    () => missions.filter((m) => m.type === 'GOAL'),
    [missions]
  )

  return (
    <DashboardShell contentClassName="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <h1 className="text-2xl font-bold sm:text-3xl">Goals & Habits</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <CardContent className="space-y-3 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-indigo-300" /> Habits
              </h2>
              {habits.length === 0 ? (
                <p className="text-sm text-white/60">
                  No habits yet for today.
                </p>
              ) : (
                habits.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-white/90">
                      {mission.title}
                    </span>
                    <span className="text-white/60">+{mission.xp} XP</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <CardContent className="space-y-3 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-fuchsia-300" /> Goals
              </h2>
              {goals.length === 0 ? (
                <p className="text-sm text-white/60">No goals yet for today.</p>
              ) : (
                goals.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-white/90">
                      {mission.title}
                    </span>
                    <span className="text-white/60">+{mission.xp} XP</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
