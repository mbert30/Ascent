import confetti from 'canvas-confetti'

import type { ConfettiTheme } from '@/lib/juice/types'

const THEME_COLORS: Record<ConfettiTheme, string[]> = {
  gold: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a'],
  purple: ['#a855f7', '#c084fc', '#e879f9', '#d946ef'],
  indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5'],
  green: ['#22c55e', '#4ade80', '#86efac', '#16a34a'],
  orange: ['#f97316', '#fb923c', '#fdba74', '#ea580c'],
  sparkle: ['#ffffff', '#fde68a', '#c4b5fd', '#67e8f9'],
}

export function burstConfetti(
  theme: ConfettiTheme,
  intensity = 1,
  reducedMotion = false
) {
  if (reducedMotion || typeof window === 'undefined') return

  const colors = THEME_COLORS[theme]
  const particleCount = Math.floor(60 * intensity)

  void confetti({
    particleCount,
    spread: 70,
    startVelocity: 35 * intensity,
    origin: { y: 0.55, x: 0.5 },
    colors,
    ticks: 180,
    gravity: 0.9,
    scalar: 0.9,
    zIndex: 9999,
  })

  void confetti({
    particleCount: Math.floor(25 * intensity),
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors,
    ticks: 160,
    zIndex: 9999,
  })

  void confetti({
    particleCount: Math.floor(25 * intensity),
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors,
    ticks: 160,
    zIndex: 9999,
  })
}

export function burstConfettiSubtle(
  theme: ConfettiTheme,
  intensity = 1,
  reducedMotion = false
) {
  if (reducedMotion || typeof window === 'undefined') return

  void confetti({
    particleCount: Math.floor(20 * intensity),
    spread: 50,
    startVelocity: 20,
    origin: { y: 0.65, x: 0.5 },
    colors: THEME_COLORS[theme],
    ticks: 120,
    gravity: 0.8,
    scalar: 0.7,
    zIndex: 9999,
  })
}
