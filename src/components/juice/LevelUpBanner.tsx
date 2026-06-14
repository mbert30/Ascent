'use client'

import { useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type LevelUpBannerProps = {
  level: number | null
  onDismiss: () => void
  reducedMotion?: boolean
}

export function LevelUpBanner({
  level,
  onDismiss,
  reducedMotion = false,
}: LevelUpBannerProps) {
  const t = useTranslations('juice')

  useEffect(() => {
    if (level == null) return
    const timer = setTimeout(onDismiss, reducedMotion ? 800 : 1500)
    return () => clearTimeout(timer)
  }, [level, onDismiss, reducedMotion])

  return (
    <AnimatePresence>
      {level != null && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[90] flex items-start justify-center pt-16 sm:pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
        >
          <div className="juice-level-flash absolute inset-0" aria-hidden />
          <motion.div
            className="level-up-badge relative flex flex-col items-center gap-2 rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/30 via-yellow-500/25 to-orange-600/30 px-8 py-5 text-center shadow-2xl shadow-amber-500/30 backdrop-blur-xl"
            initial={reducedMotion ? {} : { scale: 0.5, y: -20 }}
            animate={reducedMotion ? {} : { scale: 1, y: 0 }}
            exit={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <Sparkles className="h-8 w-8 text-amber-200" />
            <p className="text-sm font-semibold tracking-wide text-amber-100/90 uppercase">
              {t('levelUp')}
            </p>
            <p className="text-4xl font-black text-white drop-shadow-lg">
              {t('levelNumber', { level })}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
