'use client'

import { useEffect, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { AscentLogo } from '@/components/landing/AscentLogo'
import { LocaleSwitcher } from '@/components/landing/LocaleSwitcher'
import { gradientBtnClass } from '@/components/landing/marketing-styles'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function LandingHeader() {
  const t = useTranslations('landing.header')
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 shrink-0 border-b transition-shadow duration-300',
        scrolled
          ? 'border-white/10 bg-slate-950/90 shadow-lg shadow-black/30 backdrop-blur-md'
          : 'border-white/5 bg-slate-950/50 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.5rem] sm:gap-6 sm:px-8">
        <AscentLogo size="md" href={`/${locale}`} surface="dark" />

        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden px-3 text-slate-300 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Link href={`/${locale}/login`}>{t('login')}</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className={cn('px-3 sm:px-4', gradientBtnClass)}
          >
            <Link href={`/${locale}/login?tab=signup`}>{t('getStarted')}</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
