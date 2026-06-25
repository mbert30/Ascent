import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type AscentLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  showWordmark?: boolean
  href?: string
  className?: string
  wordmarkClassName?: string
  /** `light` = default logo on bright backgrounds; `dark` = white arrow/star variant */
  surface?: 'light' | 'dark'
}

const sizes = {
  sm: { img: 32, text: 'text-base' },
  md: { img: 40, text: 'text-lg' },
  lg: { img: 56, text: 'text-xl' },
  hero: { img: 88, text: 'text-3xl' },
}

export function AscentLogo({
  size = 'md',
  showWordmark = true,
  href,
  className,
  wordmarkClassName,
  surface = 'dark',
}: AscentLogoProps) {
  const { img, text } = sizes[size]
  const logoSrc = surface === 'dark' ? '/logo-dark.png' : '/logo.png'

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-3',
        href &&
          'rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500',
        className
      )}
    >
      <Image
        src={logoSrc}
        alt=""
        width={img * 2}
        height={img}
        className="h-auto shrink-0"
        style={{ height: img, width: 'auto' }}
        priority={size === 'hero'}
        aria-hidden
      />
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight',
            surface === 'dark' ? 'text-white' : 'text-slate-900',
            text,
            wordmarkClassName
          )}
        >
          Ascent
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex transition-opacity hover:opacity-85"
        aria-label="Ascent — home"
      >
        {content}
      </Link>
    )
  }

  return content
}
