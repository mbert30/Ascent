'use client'

import { useEffect, useState } from 'react'

import { useSpring, useTransform } from 'framer-motion'

type CountUpNumberProps = {
  value: number
  duration?: number
  className?: string
  formatter?: (n: number) => string
}

export function CountUpNumber({
  value,
  duration = 0.6,
  className,
  formatter = (n) => String(Math.round(n)),
}: CountUpNumberProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => formatter(v))
  const [text, setText] = useState(formatter(0))

  useEffect(() => {
    spring.set(value)
    const unsub = display.on('change', (v) => setText(v))
    return unsub
  }, [value, spring, display, formatter])

  return <span className={className}>{text}</span>
}
