'use client'

import { type ComponentProps, type ReactNode, useState } from 'react'

import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Flame, Sparkles, Star, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'

function useInteractionActive() {
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()

  if (reduced) {
    return { active: false, handlers: {}, reduced: true as const }
  }

  return {
    active,
    reduced: false as const,
    handlers: {
      onHoverStart: () => setActive(true),
      onHoverEnd: () => setActive(false),
      onTapStart: () => setActive(true),
      onTap: () => setActive(false),
      onTapCancel: () => setActive(false),
    },
  }
}

type InteractiveCardProps = HTMLMotionProps<'div'> & {
  children: ReactNode
}

export function InteractiveCard({
  children,
  className,
  ...props
}: InteractiveCardProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -5, scale: 1.015 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type InteractiveIconProps = {
  icon: LucideIcon
  className?: string
  iconClassName?: string
  children?: ReactNode
}

export function InteractiveIcon({
  icon: Icon,
  className,
  iconClassName,
  children,
}: InteractiveIconProps) {
  const { active, handlers } = useInteractionActive()

  return (
    <motion.span
      className={cn(
        'relative inline-flex cursor-pointer select-none',
        className
      )}
      animate={active ? { scale: 1.12 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      {...handlers}
      role="presentation"
    >
      <Icon className={iconClassName} aria-hidden />
      {children}
      {active && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full bg-white/10"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.6, 1.4, 1.6] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      )}
    </motion.span>
  )
}

type BurningFlameProps = {
  className?: string
  sizeClassName?: string
  showEmbers?: boolean
}

export function BurningFlame({
  className,
  sizeClassName = 'size-3.5',
  showEmbers = true,
}: BurningFlameProps) {
  const { active, handlers } = useInteractionActive()

  return (
    <motion.span
      className={cn(
        'relative inline-flex cursor-pointer select-none',
        className
      )}
      {...handlers}
      role="presentation"
    >
      <motion.span
        className="relative z-10 inline-flex"
        animate={
          active
            ? { scale: [1, 1.18, 1.08, 1.15, 1], rotate: [0, -6, 4, -4, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={
          active
            ? {
                duration: 0.45,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }
            : { duration: 0.2 }
        }
      >
        <Flame
          className={cn(
            sizeClassName,
            'transition-[filter,color] duration-200',
            active
              ? 'text-orange-200 drop-shadow-[0_0_10px_rgba(251,146,60,0.95)]'
              : 'text-orange-400'
          )}
          aria-hidden
        />
      </motion.span>

      {showEmbers && active && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute left-1/2 size-1.5 rounded-full bg-orange-400 blur-[1px]"
              style={{ top: `${-2 - i * 2}px` }}
              initial={{ opacity: 0.8, x: '-50%', y: 0, scale: 0.6 }}
              animate={{
                opacity: [0.8, 0.4, 0],
                y: [-4 - i * 3, -14 - i * 5],
                x: `${-50 + (i - 1) * 18}%`,
                scale: [0.6, 1, 0.4],
              }}
              transition={{
                duration: 0.55 + i * 0.08,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeOut',
                delay: i * 0.12,
              }}
            />
          ))}
          <motion.span
            className="pointer-events-none absolute inset-0 -z-0 rounded-full bg-orange-500/30 blur-md"
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.15, 0.95] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          />
        </>
      )}
    </motion.span>
  )
}

type SparkleStarProps = {
  className?: string
  sizeClassName?: string
  filled?: boolean
}

export function SparkleStar({
  className,
  sizeClassName = 'size-3.5',
  filled = true,
}: SparkleStarProps) {
  const { active, handlers } = useInteractionActive()

  return (
    <motion.span
      className={cn(
        'relative inline-flex cursor-pointer select-none',
        className
      )}
      {...handlers}
      role="presentation"
    >
      <motion.span
        animate={
          active
            ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.2, 1.1, 1.15, 1] }
            : {}
        }
        transition={
          active
            ? {
                duration: 0.7,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }
            : {}
        }
      >
        <Star
          className={cn(
            sizeClassName,
            filled && 'fill-amber-400',
            'text-amber-400 transition-[filter] duration-200',
            active && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
          )}
          aria-hidden
        />
      </motion.span>

      {active &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute text-amber-300"
            style={{
              top: `${[-6, -2, 2][i]}px`,
              left: `${[10, -8, 12][i]}px`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180] }}
            transition={{
              duration: 0.65,
              repeat: Infinity,
              repeatType: 'loop',
              delay: i * 0.15,
            }}
          >
            <Sparkles className="size-2" aria-hidden />
          </motion.span>
        ))}
    </motion.span>
  )
}

type PulseZapProps = {
  className?: string
  sizeClassName?: string
}

export function PulseZap({
  className,
  sizeClassName = 'h-7 w-7',
}: PulseZapProps) {
  const { active, handlers } = useInteractionActive()

  return (
    <motion.span
      className={cn(
        'relative inline-flex cursor-pointer select-none',
        className
      )}
      {...handlers}
      role="presentation"
    >
      <motion.span
        animate={
          active
            ? {
                scale: [1, 1.15, 1],
                filter: [
                  'drop-shadow(0 0 0px rgba(251,191,36,0))',
                  'drop-shadow(0 0 10px rgba(251,191,36,0.9))',
                  'drop-shadow(0 0 0px rgba(251,191,36,0))',
                ],
              }
            : {}
        }
        transition={
          active ? { duration: 0.35, repeat: Infinity, repeatType: 'loop' } : {}
        }
      >
        <Zap
          className={cn(
            sizeClassName,
            'text-amber-400',
            active && 'fill-amber-400/30'
          )}
          aria-hidden
        />
      </motion.span>
    </motion.span>
  )
}

type GlowIconProps = ComponentProps<typeof InteractiveIcon>

export function GlowIcon(props: GlowIconProps) {
  const { active, handlers } = useInteractionActive()

  return (
    <motion.span
      className={cn(
        'relative inline-flex cursor-pointer select-none',
        props.className
      )}
      animate={active ? { scale: [1, 1.1, 1.05] } : { scale: 1 }}
      transition={
        active
          ? {
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }
          : { duration: 0.2 }
      }
      {...handlers}
      role="presentation"
    >
      <props.icon
        className={cn(
          props.iconClassName,
          active && 'drop-shadow-[0_0_12px_currentColor]'
        )}
        aria-hidden
      />
    </motion.span>
  )
}
