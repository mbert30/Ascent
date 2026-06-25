'use client'

import { useLocale } from 'next-intl'

import { cn } from '@/lib/utils'

import { usePathname, useRouter } from '@/i18n/routing'

type LocaleSwitcherProps = {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (next: 'en' | 'fr') => {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5',
        className
      )}
      role="group"
      aria-label="Language"
    >
      {(['en', 'fr'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLocale(lang)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition sm:px-3 sm:text-sm',
            locale === lang
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
