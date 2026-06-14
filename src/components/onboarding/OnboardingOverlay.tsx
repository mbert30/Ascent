'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

import type { OnboardingAdvanceEvent } from '@/lib/onboarding/steps'
import { cn } from '@/lib/utils'

import { useOnboarding } from './OnboardingProvider'

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

const SPOTLIGHT_PADDING = 8

function routeFromPathname(pathname: string): string | null {
  if (pathname.includes('/achievements')) return 'achievements'
  if (pathname.includes('/shop')) return 'shop'
  if (pathname.includes('/settings')) return 'settings'
  if (pathname.includes('/dashboard')) return 'dashboard'
  return null
}

function isInteractiveStep(advanceOn: OnboardingAdvanceEvent) {
  return (
    advanceOn !== 'next' &&
    advanceOn !== 'navigate-shop' &&
    advanceOn !== 'navigate-dashboard' &&
    advanceOn !== 'navigate-achievements'
  )
}

function BackdropPanels({ rect }: { rect: Rect | null }) {
  if (!rect) {
    return (
      <div className="pointer-events-auto absolute inset-0 bg-black/72 backdrop-blur-[1px]" />
    )
  }

  const panels = [
    { top: 0, left: 0, width: '100%', height: rect.top },
    {
      top: rect.top,
      left: 0,
      width: rect.left,
      height: rect.height,
    },
    {
      top: rect.top,
      left: rect.left + rect.width,
      right: 0,
      height: rect.height,
    },
    {
      top: rect.top + rect.height,
      left: 0,
      width: '100%',
      bottom: 0,
    },
  ]

  return (
    <>
      {panels.map((style, i) => (
        <div
          key={i}
          className="pointer-events-auto absolute bg-black/72 backdrop-blur-[1px]"
          style={style}
        />
      ))}
    </>
  )
}

export function OnboardingOverlay() {
  const t = useTranslations('onboarding')
  const pathname = usePathname()
  const currentRoute = routeFromPathname(pathname)
  const { active, paused, currentStep, stepIndex, totalSteps, advance, skip } =
    useOnboarding()

  const [targetRect, setTargetRect] = useState<Rect | null>(null)

  const progressPercent = useMemo(
    () => Math.round(((stepIndex + 1) / totalSteps) * 100),
    [stepIndex, totalSteps]
  )

  const isLastStep = stepIndex === totalSteps - 1
  const insideAppModal =
    currentStep?.id === 'claim-level-modal' ||
    currentStep?.id === 'streak-modal'

  const updateRect = useCallback(() => {
    if (
      !currentStep ||
      currentStep.type !== 'spotlight' ||
      !currentStep.target
    ) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(
      `[data-onboarding="${currentStep.target}"]`
    )
    if (!el) {
      setTargetRect(null)
      return
    }
    const scrollBlock =
      currentStep.target === 'back-dashboard'
        ? 'start'
        : currentStep.target === 'tutorial-mission'
          ? 'center'
          : 'nearest'
    el.scrollIntoView({ block: scrollBlock, behavior: 'smooth' })
    const box = el.getBoundingClientRect()
    setTargetRect({
      top: box.top - SPOTLIGHT_PADDING,
      left: box.left - SPOTLIGHT_PADDING,
      width: box.width + SPOTLIGHT_PADDING * 2,
      height: box.height + SPOTLIGHT_PADDING * 2,
    })
  }, [currentStep])

  useLayoutEffect(() => {
    if (!active || paused || !currentStep) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetRect(null)
      return
    }
    if (currentStep.route !== currentRoute) {
      setTargetRect(null)
      return
    }
    updateRect()
    const timer = setTimeout(updateRect, 350)
    return () => clearTimeout(timer)
  }, [active, paused, currentStep, currentRoute, stepIndex, updateRect])

  useEffect(() => {
    if (!active || paused) return
    const onResize = () => updateRect()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [active, paused, updateRect])

  useEffect(() => {
    if (!active || !currentStep) return
    if (
      currentStep.id === 'back-dashboard' ||
      currentStep.id === 'create-reward' ||
      currentStep.id === 'complete-tutorial'
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const timer = setTimeout(updateRect, 400)
      return () => clearTimeout(timer)
    }
  }, [active, currentStep, updateRect])

  useEffect(() => {
    if (!active || paused || !currentStep?.target) return
    const el = document.querySelector(
      `[data-onboarding="${currentStep.target}"]`
    )
    if (!el) return
    const interactive = isInteractiveStep(currentStep.advanceOn)
    el.classList.add('relative', 'z-[80]')
    if (interactive) {
      el.classList.add('pointer-events-auto')
    }
    return () => {
      el.classList.remove('relative', 'z-[80]', 'pointer-events-auto')
    }
  }, [active, paused, currentStep, stepIndex])

  if (!active || paused || !currentStep) return null
  if (currentStep.route !== currentRoute) return null

  const showNextButton = currentStep.advanceOn === 'next'
  const interactive = isInteractiveStep(currentStep.advanceOn)
  const title = t(currentStep.titleKey)
  const body = t(currentStep.bodyKey)
  const cta = currentStep.ctaKey ? t(currentStep.ctaKey) : t('next')

  if (currentStep.type === 'modal') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/98 p-6 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-medium text-white/40">
            {t('progress', { percent: progressPercent })}
          </p>
          <h2 className="mt-2 text-xl font-bold">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
          <div
            className={cn(
              'mt-6 flex items-center gap-4',
              isLastStep ? 'justify-end' : 'justify-between'
            )}
          >
            {!isLastStep && (
              <button
                type="button"
                onClick={skip}
                className="text-xs text-white/35 transition hover:text-white/55"
              >
                {t('skip')}
              </button>
            )}
            <Button
              type="button"
              onClick={advance}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95"
            >
              {cta}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const popoverAtTop =
    interactive &&
    (currentStep.id === 'create-reward' ||
      currentStep.id === 'complete-tutorial' ||
      (targetRect != null && targetRect.top > window.innerHeight * 0.4))

  const popoverStyle: React.CSSProperties = interactive
    ? popoverAtTop
      ? {
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'auto',
        }
      : {
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          top: 'auto',
        }
    : targetRect
      ? {
          top: Math.min(
            targetRect.top + targetRect.height + 12,
            window.innerHeight - 220
          ),
          left: Math.max(
            16,
            Math.min(targetRect.left, window.innerWidth - 336)
          ),
        }
      : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }

  return (
    <>
      <div
        className={cn(
          'pointer-events-none fixed inset-0',
          insideAppModal ? 'z-[45]' : 'z-[70]'
        )}
      >
        <BackdropPanels rect={targetRect} />

        {targetRect && (
          <div
            className="pointer-events-none absolute rounded-xl ring-2 ring-indigo-400/80"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />
        )}
      </div>

      <div
        className={cn(
          'pointer-events-auto fixed z-[75] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/20 bg-slate-900/98 p-4 text-white shadow-2xl backdrop-blur-xl',
          !targetRect && !interactive && 'max-w-sm',
          interactive && 'max-w-md'
        )}
        style={popoverStyle}
      >
        <p className="text-xs font-medium text-white/40">
          {t('progress', { percent: progressPercent })}
        </p>
        <h2 className="mt-1.5 text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
        <div
          className={cn(
            'mt-4 flex items-center gap-3',
            showNextButton && !isLastStep ? 'justify-between' : 'justify-start'
          )}
        >
          {!isLastStep && (
            <button
              type="button"
              onClick={skip}
              className="text-xs text-white/35 transition hover:text-white/55"
            >
              {t('skip')}
            </button>
          )}
          {showNextButton && (
            <Button
              type="button"
              size="sm"
              onClick={advance}
              className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95"
            >
              {cta}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
