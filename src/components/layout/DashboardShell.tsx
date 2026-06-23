import type { ReactNode } from 'react'

import { AdBanner } from '@/components/ads/AdBanner'

import { cn } from '@/lib/utils'

type DashboardShellProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function DashboardShell({
  children,
  className,
  contentClassName,
}: DashboardShellProps) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 -left-24 size-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--ascent-glow-a)' }}
        />
        <div
          className="absolute top-1/3 right-[-10%] size-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--ascent-glow-b)' }}
        />
        <div
          className="absolute bottom-[-20%] left-1/4 size-[380px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--ascent-glow-c)' }}
        />
      </div>

      <AdBanner />
      <div className={cn('relative z-10 p-4 md:p-6 lg:p-8', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
