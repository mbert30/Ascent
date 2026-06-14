'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { motion } from 'framer-motion'
import { Palette, Sparkles } from 'lucide-react'

import { useJuiceOptional } from '@/components/juice/useJuice'
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
  skipSound?: boolean
}

export function ThemeUnlockModal({
  themeId,
  onClose,
  onTryNow,
  skipSound = false,
}: ThemeUnlockModalProps) {
  const t = useTranslations('themes')
  const juice = useJuiceOptional()
  const playedRef = useRef<string | null>(null)
  const open = themeId != null
  const theme = themeId ? getThemeById(themeId) : null

  useEffect(() => {
    if (!open || !themeId || skipSound || !juice) return
    if (playedRef.current === themeId) return
    playedRef.current = themeId
    juice.playThemeUnlocked()
  }, [open, themeId, skipSound, juice])

  if (!theme) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="ascent-dialog-surface border backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3 text-center text-xl">
            <motion.span
              className="reward-pop-badge flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              {t('unlockTitle')}
            </motion.span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <motion.div
            className={cn(
              'h-24 w-full rounded-xl bg-gradient-to-br shadow-lg',
              theme.preview
            )}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
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
