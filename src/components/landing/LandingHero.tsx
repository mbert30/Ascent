'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { AscentLogo } from '@/components/landing/AscentLogo'
import {
  gradientBtnClass,
  marketingOutlineBtnClass,
} from '@/components/landing/marketing-styles'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function LandingHero() {
  const t = useTranslations('landing.hero')
  const locale = useLocale()
  const { scrollY } = useScroll()
  const contentOpacity = useTransform(scrollY, [0, 320], [1, 0])
  const contentY = useTransform(scrollY, [0, 320], [0, -48])
  const logoScale = useTransform(scrollY, [0, 400], [1, 0.88])
  const hintOpacity = useTransform(scrollY, [0, 120], [1, 0])

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[calc(100dvh-4.5rem)] sm:px-8">
      <motion.div
        className="flex w-full max-w-3xl flex-col items-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          className="mb-10 flex justify-center"
          style={{ scale: logoScale }}
        >
          <AscentLogo size="hero" showWordmark={false} surface="dark" />
        </motion.div>

        <motion.h1
          className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.p
          className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('description')}
        </motion.p>

        <motion.div
          className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            size="lg"
            asChild
            className={cn('h-12 text-base', gradientBtnClass)}
          >
            <Link href={`/${locale}/login?tab=signup`}>{t('cta')}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className={cn('h-12 text-base', marketingOutlineBtnClass)}
          >
            <Link href={`/${locale}/login`}>{t('ctaSecondary')}</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.a
        href="#loop"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-slate-500 transition-colors hover:text-indigo-300"
        style={{ opacity: hintOpacity }}
      >
        <span className="text-xs">{t('scrollHint')}</span>
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
      </motion.a>
    </section>
  )
}
