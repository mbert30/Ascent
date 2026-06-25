'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type MarketingAtmosphereProps = {
  interactive?: boolean
}

function spotRadius() {
  if (typeof window === 'undefined') return 280
  return Math.min(window.innerWidth * 0.44, 380)
}

export function MarketingAtmosphere({
  interactive = true,
}: MarketingAtmosphereProps) {
  const fogRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const target = useRef({ x: -9999, y: -9999 })
  const current = useRef({ x: -9999, y: -9999 })
  const hasPointer = useRef(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [parallaxY, setParallaxY] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReduced = () => setReducedMotion(mq.matches)
    updateReduced()
    mq.addEventListener('change', updateReduced)
    return () => mq.removeEventListener('change', updateReduced)
  }, [])

  useEffect(() => {
    if (!interactive || reducedMotion) return

    const isFinePointer = window.matchMedia('(pointer: fine)').matches

    const onPointerMove = (e: PointerEvent) => {
      hasPointer.current = true
      target.current = { x: e.clientX, y: e.clientY }
    }

    if (isFinePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    let driftAngle = 0

    const paint = () => {
      const x = current.current.x
      const y = current.current.y
      const r = spotRadius()

      if (fogRef.current) {
        fogRef.current.style.background = `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.08) 28%, rgba(2, 6, 23, 0.82) 58%, rgba(2, 6, 23, 0.94) 100%)`
      }

      if (orbRef.current) {
        orbRef.current.style.background = `radial-gradient(circle ${r * 0.7}px at ${x}px ${y}px, rgba(192, 132, 252, 0.55) 0%, rgba(129, 140, 248, 0.35) 32%, rgba(236, 72, 153, 0.15) 52%, transparent 68%)`
      }

      if (coreRef.current) {
        coreRef.current.style.background = `radial-gradient(circle ${Math.min(r * 0.22, 90)}px at ${x}px ${y}px, rgba(255, 255, 255, 0.22) 0%, rgba(196, 181, 253, 0.12) 40%, transparent 70%)`
      }
    }

    const tick = () => {
      if (!isFinePointer || !hasPointer.current) {
        driftAngle += 0.012
        const w = window.innerWidth
        const h = window.innerHeight
        target.current = {
          x: w * 0.5 + Math.cos(driftAngle) * w * 0.22,
          y: h * 0.42 + Math.sin(driftAngle * 0.85) * h * 0.18,
        }
      }

      current.current.x += (target.current.x - current.current.x) * 0.14
      current.current.y += (target.current.y - current.current.y) * 0.14
      paint()

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [interactive, reducedMotion])

  useEffect(() => {
    if (!interactive) return

    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      setParallaxY(window.scrollY)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [interactive])

  const showSpotlight = interactive && !reducedMotion

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            transform: interactive
              ? `translateY(${parallaxY * 0.1}px)`
              : undefined,
          }}
        >
          <div
            className={cn(
              'absolute inset-[-30%]',
              !reducedMotion && 'marketing-gradient-drift'
            )}
            style={{
              background:
                'conic-gradient(from 200deg at 50% 50%, #4f46e5, #9333ea, #ec4899, #c026d3, #6366f1, #4f46e5)',
            }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 25% 15%, rgb(99 102 241 / 0.7), transparent 55%), radial-gradient(ellipse 80% 60% at 80% 75%, rgb(236 72 153 / 0.55), transparent 50%)',
            transform: interactive
              ? `translateY(${parallaxY * -0.05}px)`
              : undefined,
          }}
        />
      </div>

      {showSpotlight && (
        <>
          <div
            ref={orbRef}
            className="pointer-events-none fixed inset-0 z-[2] mix-blend-screen"
            aria-hidden
          />
          <div
            ref={coreRef}
            className="pointer-events-none fixed inset-0 z-[2] mix-blend-soft-light"
            aria-hidden
          />
        </>
      )}

      <div
        ref={fogRef}
        className="pointer-events-none fixed inset-0 z-[3]"
        style={showSpotlight ? undefined : { background: 'rgb(2 6 23 / 0.9)' }}
        aria-hidden
      />

      <div
        className="pointer-events-none fixed inset-0 z-[4] overflow-hidden opacity-40"
        aria-hidden
      >
        <div
          className="absolute -top-32 -left-24 size-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--ascent-glow-a)' }}
        />
        <div
          className="absolute top-1/3 right-[-10%] size-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--ascent-glow-b)' }}
        />
      </div>

      {interactive && (
        <div
          className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
          style={{
            transform: `scaleX(${scrollProgress})`,
            opacity: scrollProgress > 0.01 ? 1 : 0,
          }}
          aria-hidden
        />
      )}
    </>
  )
}
