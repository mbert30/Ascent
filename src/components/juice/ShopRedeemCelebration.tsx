'use client'

import { useTranslations } from 'next-intl'

import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { ShopRedeemPayload } from '@/lib/juice/types'

type ShopRedeemCelebrationProps = {
  data: ShopRedeemPayload | null
  onClose: () => void
}

export function ShopRedeemCelebration({
  data,
  onClose,
}: ShopRedeemCelebrationProps) {
  const t = useTranslations('juice')

  return (
    <Dialog open={data != null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-emerald-500/40 bg-gradient-to-br from-emerald-600/25 via-teal-600/20 to-cyan-600/25 text-white backdrop-blur-xl sm:max-w-sm">
        {data && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-col items-center gap-3 text-center">
                <motion.span
                  className="reward-pop-badge flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl shadow-lg"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                >
                  {data.icon ?? '🎁'}
                </motion.span>
                <span className="text-xl">{t('shopRedeemTitle')}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{data.title}</p>
              <motion.p
                className="flex items-center gap-2 text-amber-200"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Coins className="h-5 w-5" />
                {t('shopRedeemCost', { cost: data.cost })}
              </motion.p>
              <Button
                type="button"
                onClick={onClose}
                className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95"
              >
                {t('shopRedeemCta')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
