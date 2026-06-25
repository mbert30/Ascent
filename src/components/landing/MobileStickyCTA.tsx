'use client'

import { useEffect, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { gradientBtnClass } from '@/components/landing/marketing-styles'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export function MobileStickyCTA() {
  const t = useTranslations('landing.stickyCta')
  const locale = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const footer = document.getElementById('landing-footer')
    const heroThreshold = window.innerHeight * 0.55

    const update = () => {
      const pastHero = window.scrollY > heroThreshold
      const footerTop = footer?.getBoundingClientRect().top ?? Infinity
      const footerNear = footerTop < window.innerHeight * 0.92
      setVisible(pastHero && !footerNear)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-300 md:hidden',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="pointer-events-auto mx-auto max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
        <p className="mb-2 text-center text-xs text-slate-400">{t('hint')}</p>
        <Button
          size="lg"
          asChild
          className={cn('h-11 w-full', gradientBtnClass)}
        >
          <Link href={`/${locale}/login?tab=signup`}>{t('cta')}</Link>
        </Button>
      </div>
    </div>
  )
}
