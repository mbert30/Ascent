'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Check, Lock, Wand2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  THEMES,
  getAchievementNameKeyForTheme,
  getThemeById,
  getUnlockDetailKey,
  getUnlockDetailParams,
} from '@/lib/themes/definitions'
import { cn } from '@/lib/utils'

interface ThemePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentThemeId: string
  unlockedThemeIds: string[]
  onThemeSelect: (themeId: string) => void | Promise<void>
  onOpen?: () => void | Promise<void>
}

export function ThemePicker({
  open,
  onOpenChange,
  currentThemeId,
  unlockedThemeIds,
  onThemeSelect,
  onOpen,
}: ThemePickerProps) {
  const t = useTranslations('dashboard.themePicker')
  const tThemes = useTranslations('themes')
  const tAch = useTranslations('achievements')
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId)
  const [lockedDetailId, setLockedDetailId] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedThemeId(currentThemeId)
      setLockedDetailId(null)
      void onOpen?.()
    }
    onOpenChange(nextOpen)
  }

  const unlockedSet = new Set(unlockedThemeIds)
  const selectedTheme = getThemeById(selectedThemeId)
  const lockedDetailTheme = lockedDetailId ? getThemeById(lockedDetailId) : null

  const handleSave = () => {
    if (unlockedSet.has(selectedThemeId)) {
      onThemeSelect(selectedThemeId)
      onOpenChange(false)
    }
  }

  const unlockDetailText = (theme: (typeof THEMES)[number]) => {
    const achKey = getAchievementNameKeyForTheme(theme)
    const params = getUnlockDetailParams(theme)
    if (achKey) {
      return tThemes(getUnlockDetailKey(theme), {
        ...params,
        achievement: tAch(achKey),
      })
    }
    return tThemes(getUnlockDetailKey(theme), params)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="ascent-dialog-surface flex max-h-[min(85dvh,640px)] max-w-sm flex-col gap-0 overflow-hidden p-0 backdrop-blur-xl sm:max-w-sm">
        <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-3 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-violet-300" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-xs opacity-70">
            {selectedTheme ? tThemes(selectedTheme.nameKey) : t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id
              const isUnlocked = unlockedSet.has(theme.id)
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedThemeId(theme.id)
                      setLockedDetailId(null)
                    } else {
                      setLockedDetailId(
                        lockedDetailId === theme.id ? null : theme.id
                      )
                    }
                  }}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                    isUnlocked
                      ? isSelected
                        ? 'border-violet-400 ring-2 ring-violet-400/40'
                        : 'border-white/25 hover:border-white/50'
                      : 'border-white/15 hover:border-white/30'
                  )}
                  aria-label={tThemes(theme.nameKey)}
                >
                  <div
                    className={cn(
                      'h-full w-full bg-gradient-to-br',
                      theme.preview,
                      !isUnlocked && 'opacity-40 saturate-50'
                    )}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Lock className="h-4 w-4 text-white/90" />
                    </div>
                  )}
                  {isUnlocked && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-500/25">
                      <Check className="h-5 w-5 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {lockedDetailTheme && !unlockedSet.has(lockedDetailTheme.id) && (
            <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {tThemes(lockedDetailTheme.nameKey)}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed opacity-75">
                    {unlockDetailText(lockedDetailTheme)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLockedDetailId(null)}
                  className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100"
                  aria-label={t('actions.cancel')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-white/20 bg-white/10 hover:bg-white/20"
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!unlockedSet.has(selectedThemeId)}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
          >
            {t('actions.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
