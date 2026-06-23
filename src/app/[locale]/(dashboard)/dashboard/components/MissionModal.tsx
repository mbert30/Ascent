'use client'

import { useEffect, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { toBcp47Locale } from '@/lib/locale'
import { isRecurringHabit } from '@/lib/missions/recurrence'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Fitness',
  'Learning',
  'Productivity',
  'Health',
  'Wellness',
  'Career',
]

const QUICK_TEMPLATES = [
  {
    id: 'hydrate',
    category: 'Health',
    type: 'HABIT' as const,
    xp: 20,
  },
  {
    id: 'workout',
    category: 'Fitness',
    type: 'HABIT' as const,
    xp: 45,
  },
  {
    id: 'deepWork',
    category: 'Productivity',
    type: 'GOAL' as const,
    xp: 60,
  },
  {
    id: 'read',
    category: 'Learning',
    type: 'HABIT' as const,
    xp: 30,
  },
]

export type MissionForModal = {
  id: string
  title: string
  category: string
  type: 'HABIT' | 'GOAL'
  xp: number
  dueAt: string
  status: string
  repeatKey?: string | null
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

function formatTimeForDisplay(dateTimeLocal: string, locale: string): string {
  if (!dateTimeLocal) return ''
  const d = new Date(dateTimeLocal)
  const isFR = locale.startsWith('fr')
  if (isFR) {
    const h = d.getHours()
    const m = d.getMinutes()
    return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  }
  return d.toLocaleTimeString(toBcp47Locale(locale), {
    hour: 'numeric',
    minute: d.getMinutes() ? '2-digit' : undefined,
    hour12: true,
  })
}

function formatDueFriendly(
  dateTimeLocal: string,
  locale: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  if (!dateTimeLocal) return ''
  const d = new Date(dateTimeLocal)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const time = formatTimeForDisplay(dateTimeLocal, locale)
  if (dueDate.getTime() === today.getTime()) {
    return t('dueFriendlyToday', { time })
  }
  if (dueDate.getTime() === yesterday.getTime()) {
    return t('dueFriendlyYesterday', { time })
  }
  if (dueDate.getTime() === tomorrow.getTime()) {
    return t('dueFriendlyTomorrow', { time })
  }
  const date = d.toLocaleDateString(toBcp47Locale(locale), {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
  return t('dueFriendlyDate', { date, time })
}

type MissionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mission: MissionForModal | null
  onSuccess: () => void
  onCreated?: () => void
}

export function MissionModal({
  open,
  onOpenChange,
  mission,
  onSuccess,
  onCreated,
}: MissionModalProps) {
  const locale = useLocale()
  const t = useTranslations('dashboard.overview.missionModal')
  const tMissions = useTranslations('dashboard.overview.missions')
  const isEdit = !!mission
  const inputLang = locale.startsWith('fr') ? 'fr-FR' : 'en'

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [type, setType] = useState<'HABIT' | 'GOAL'>('HABIT')
  const [xp, setXp] = useState(20)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'easy'
  )
  const [dueDateTime, setDueDateTime] = useState('')
  const [repeat, setRepeat] = useState<'NONE' | 'DAILY' | 'WEEKLY'>('NONE')
  const [editingDue, setEditingDue] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteChoiceOpen, setDeleteChoiceOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dueDatePart = dueDateTime ? dueDateTime.slice(0, 10) : ''
  const dueTimePart = dueDateTime ? dueDateTime.slice(11, 16) : ''
  const setDueFromParts = (date: string, time: string) => {
    if (date && time) setDueDateTime(`${date}T${time}`)
  }

  useEffect(() => {
    if (!open) return

    setError(null)
    setEditingDue(false)
    if (mission) {
      setTitle(mission.title)
      setCategory(mission.category)
      setType(mission.type)
      setXp(mission.xp)
      setDifficulty(
        mission.xp >= 60 ? 'hard' : mission.xp >= 35 ? 'medium' : 'easy'
      )
      setDueDateTime(toDateTimeLocal(mission.dueAt))
      setRepeat('NONE')
    } else {
      const now = new Date()
      now.setMinutes(0)
      now.setHours(now.getHours() + 1)
      setTitle('')
      setCategory(CATEGORIES[0])
      setType('HABIT')
      setXp(20)
      setDifficulty('easy')
      setDueDateTime(toDateTimeLocal(now.toISOString()))
      setRepeat('NONE')
    }
  }, [open, mission])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const dueAt = new Date(dueDateTime).toISOString()
      if (isEdit && mission) {
        const res = await fetch(`/api/missions/${mission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            category: category.trim(),
            type,
            xp: Number(xp),
            dueAt,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update')
        }
      } else {
        const res = await fetch('/api/missions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            category: category.trim(),
            type,
            xp: Number(xp),
            dueAt,
            repeat,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to create')
        }
        onCreated?.()
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (scope: 'single' | 'future') => {
    if (!mission) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/missions/${mission.id}?scope=${scope === 'future' ? 'future' : 'single'}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed to delete')
      setDeleteChoiceOpen(false)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const onDeleteClick = () => {
    if (!mission) return
    if (isRecurringHabit(mission)) {
      setDeleteChoiceOpen(true)
      return
    }
    if (!confirm(t('deleteConfirm'))) return
    void handleDelete('single')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/20 bg-slate-900/98 text-white backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('editTitle') : t('newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="mission-title">{t('titleLabel')}</Label>
            <Input
              id="mission-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              required
            />
            {!isEdit && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/10"
                    onClick={() => {
                      setTitle(t(`templates.${template.id}`))
                      setCategory(template.category)
                      setType(template.type)
                      setXp(template.xp)
                      setRepeat(template.type === 'HABIT' ? 'DAILY' : 'NONE')
                      setDifficulty(
                        template.xp >= 60
                          ? 'hard'
                          : template.xp >= 35
                            ? 'medium'
                            : 'easy'
                      )
                    }}
                  >
                    {t(`templates.${template.id}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t('categoryLabel')}</Label>
            <Select
              value={category || CATEGORIES[0]}
              onValueChange={setCategory}
              required
            >
              <SelectTrigger className="w-full border-white/20 bg-white/10 text-white">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent
                className="border-white/20 text-white"
                style={{ backgroundColor: 'rgb(30 41 59)' }}
              >
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-white focus:text-white data-[highlighted]:bg-slate-600"
                    style={{ backgroundColor: 'rgb(30 41 59)' }}
                  >
                    {t(`categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('typeLabel')}</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                const nextType = v as 'HABIT' | 'GOAL'
                setType(nextType)
                if (!isEdit) {
                  setRepeat(nextType === 'HABIT' ? 'DAILY' : 'NONE')
                }
              }}
            >
              <SelectTrigger className="w-full border-white/20 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="border-white/20 text-white"
                style={{ backgroundColor: 'rgb(30 41 59)' }}
              >
                <SelectItem
                  value="HABIT"
                  className="text-white data-[highlighted]:bg-slate-600"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                >
                  {tMissions('type.habit')}
                </SelectItem>
                <SelectItem
                  value="GOAL"
                  className="text-white data-[highlighted]:bg-slate-600"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                >
                  {tMissions('type.goal')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-white/60">
              {type === 'HABIT' ? t('typeHintHabit') : t('typeHintGoal')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission-xp">{t('difficultyLabel')}</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'easy', value: 20, label: t('difficultyEasy') },
                { key: 'medium', value: 40, label: t('difficultyMedium') },
                { key: 'hard', value: 70, label: t('difficultyHard') },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition',
                    difficulty === option.key
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                  onClick={() => {
                    setDifficulty(option.key as 'easy' | 'medium' | 'hard')
                    setXp(option.value)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/60">
              {t('xpAutoHint', { xp: String(xp) })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission-due">{t('dueLabel')}</Label>
            {!editingDue && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/10"
                  onClick={() => {
                    const d = new Date()
                    d.setHours(19, 0, 0, 0)
                    setDueDateTime(toDateTimeLocal(d.toISOString()))
                  }}
                >
                  {t('duePresetTonight')}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/10"
                  onClick={() => {
                    const d = new Date()
                    d.setDate(d.getDate() + 1)
                    d.setHours(8, 30, 0, 0)
                    setDueDateTime(toDateTimeLocal(d.toISOString()))
                  }}
                >
                  {t('duePresetTomorrowMorning')}
                </button>
              </div>
            )}
            {editingDue ? (
              <div className="flex gap-2">
                <Input
                  id="mission-due-date"
                  type="date"
                  lang={inputLang}
                  value={dueDatePart}
                  onChange={(e) => setDueFromParts(e.target.value, dueTimePart)}
                  required
                  className="flex-1 border-white/20 bg-white/10 text-white [color-scheme:dark]"
                />
                <Input
                  id="mission-due-time"
                  type="time"
                  lang={inputLang}
                  value={dueTimePart}
                  onChange={(e) => setDueFromParts(dueDatePart, e.target.value)}
                  required
                  className="w-32 border-white/20 bg-white/10 text-white [color-scheme:dark]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => setEditingDue(false)}
                >
                  {t('dueDone')}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                id="mission-due"
                className="flex w-full cursor-pointer items-center rounded-md border border-white/20 bg-white/10 px-3 py-2 text-left text-white transition hover:bg-white/15"
                onClick={() => setEditingDue(true)}
              >
                {formatDueFriendly(dueDateTime, locale, t)}
              </button>
            )}
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label>{t('repeatLabel')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRepeat('NONE')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition',
                    repeat === 'NONE'
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80'
                  )}
                >
                  {t('repeatNone')}
                </button>
                <button
                  type="button"
                  onClick={() => setRepeat('DAILY')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition',
                    repeat === 'DAILY'
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80'
                  )}
                >
                  {t('repeatDaily')}
                </button>
                <button
                  type="button"
                  onClick={() => setRepeat('WEEKLY')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition',
                    repeat === 'WEEKLY'
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80'
                  )}
                >
                  {t('repeatWeekly')}
                </button>
              </div>
              {repeat !== 'NONE' && (
                <p className="text-xs text-white/60">{t('repeatHint')}</p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving}
                className={cn(
                  'flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                )}
              >
                {saving ? '…' : t('save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
            </div>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                onClick={onDeleteClick}
                disabled={deleting}
              >
                {deleting ? '…' : t('delete')}
              </Button>
            )}
          </div>
          {deleteChoiceOpen && (
            <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-white">
                {t('deleteScopeTitle')}
              </p>
              <p className="text-xs text-white/60">{t('deleteScopeHint')}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  disabled={deleting}
                  onClick={() => void handleDelete('single')}
                >
                  {t('deleteTodayOnly')}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  disabled={deleting}
                  onClick={() => void handleDelete('future')}
                >
                  {t('deleteAllFuture')}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-white/50 hover:text-white"
                onClick={() => setDeleteChoiceOpen(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
