'use client'

import { useTranslations } from 'next-intl'

import { Palette, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { getThemeById } from '@/lib/themes/definitions'
import { cn } from '@/lib/utils'

type ThemeUnlockModalProps = {
  themeId: string | null
  onClose: () => void
  onTryNow: (themeId: string) => void | Promise<void>
}

export function ThemeUnlockModal({
  themeId,
  onClose,
  onTryNow,
}: ThemeUnlockModalProps) {
  const t = useTranslations('themes')
  const open = themeId != null
  const theme = themeId ? getThemeById(themeId) : null

  if (!theme) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="ascent-dialog-surface border backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3 text-center text-xl">
            <span className="reward-pop-badge flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </span>
            {t('unlockTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div
            className={cn(
              'h-24 w-full rounded-xl bg-gradient-to-br shadow-lg',
              theme.preview
            )}
          />
          <div className="text-center">
            <p className="text-lg font-bold">{t(theme.nameKey)}</p>
            <p className="text-sm opacity-70">{t(theme.descriptionKey)}</p>
          </div>
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            onClick={async () => {
              await onTryNow(theme.id)
              onClose()
            }}
          >
            <Palette className="mr-2 h-4 w-4" />
            {t('tryNow')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
