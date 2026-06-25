import type { ReactNode } from 'react'

import { MarketingAtmosphere } from '@/components/landing/MarketingAtmosphere'

import { cn } from '@/lib/utils'

type MarketingShellProps = {
  children: ReactNode
  className?: string
  fixedViewport?: boolean
}

export function MarketingShell({
  children,
  className,
  fixedViewport = false,
}: MarketingShellProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-col bg-slate-950 text-slate-100',
        fixedViewport && 'h-dvh overflow-hidden',
        className
      )}
      data-ascent-theme="dark"
    >
      <MarketingAtmosphere interactive={!fixedViewport} />

      <div
        className={cn(
          'relative z-10 flex flex-1 flex-col',
          fixedViewport ? 'h-full min-h-0' : 'min-h-dvh'
        )}
      >
        {children}
      </div>
    </div>
  )
}
