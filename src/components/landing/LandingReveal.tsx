'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'

import { motion, useInView } from 'framer-motion'

import { cn } from '@/lib/utils'

type LandingRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  index?: number
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  index = 0,
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '-60px 0px -40px 0px' })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        duration: 0.45,
        delay: inView ? delay + index * 0.08 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export function LandingSectionHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
