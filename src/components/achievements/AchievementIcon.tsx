'use client'

import type { AchievementFrame } from '@/lib/achievements/definitions'
import {
  achievementFrameClass,
  achievementInnerClass,
  isGemFrame,
} from '@/lib/achievements/frames'
import { cn } from '@/lib/utils'

type AchievementIconProps = {
  icon: string
  frame?: AchievementFrame | null
  size?: 'sm' | 'md' | 'lg'
  locked?: boolean
  pulse?: boolean
  progress?: number
  className?: string
}

const sizeMap = {
  sm: { outer: 56, inner: 44, emoji: 'text-xl', badge: 'text-[9px]' },
  md: { outer: 72, inner: 56, emoji: 'text-2xl', badge: 'text-[10px]' },
  lg: { outer: 96, inner: 76, emoji: 'text-4xl', badge: 'text-xs' },
}

const frameRingColor: Record<AchievementFrame, string> = {
  bronze: '#d97706',
  silver: '#cbd5e1',
  gold: '#fbbf24',
  diamond: '#67e8f9',
  ruby: '#f43f5e',
  emerald: '#34d399',
  sapphire: '#3b82f6',
  amethyst: '#c084fc',
  topaz: '#fbbf24',
}

const frameBadge: Record<AchievementFrame, string> = {
  bronze: 'I',
  silver: 'II',
  gold: 'III',
  diamond: 'IV',
  ruby: 'IV',
  emerald: 'IV',
  sapphire: 'IV',
  amethyst: 'IV',
  topaz: 'IV',
}

const gemBadgeClass: Partial<Record<AchievementFrame, string>> = {
  diamond:
    'bg-gradient-to-br from-cyan-300 via-white to-sky-400 text-slate-900',
  ruby: 'bg-gradient-to-br from-rose-900 via-rose-500 to-pink-300 text-white',
  emerald:
    'bg-gradient-to-br from-emerald-900 via-emerald-500 to-lime-300 text-white',
  sapphire:
    'bg-gradient-to-br from-blue-950 via-blue-500 to-sky-300 text-white',
  amethyst:
    'bg-gradient-to-br from-violet-950 via-purple-500 to-fuchsia-300 text-white',
  topaz:
    'bg-gradient-to-br from-amber-900 via-amber-400 to-yellow-200 text-amber-950',
}

export function AchievementIcon({
  icon,
  frame,
  size = 'md',
  locked = false,
  pulse = false,
  progress = 0,
  className,
}: AchievementIconProps) {
  const s = sizeMap[size]
  const radius = s.outer / 2 - 4
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const ringStroke = frame && !locked ? frameRingColor[frame] : '#f59e0b'

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center',
        pulse && 'achievement-pulse',
        className
      )}
      style={{ width: s.outer, height: s.outer }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={s.outer}
        height={s.outer}
        aria-hidden
      >
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={3}
        />
        {!locked && (
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={ringStroke}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        )}
      </svg>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-2xl border-2 shadow-lg',
          s.emoji,
          locked && 'achievement-inner-locked border-white/15',
          frame && !locked
            ? cn(
                achievementInnerClass(frame),
                achievementFrameClass(frame),
                isGemFrame(frame) && 'achievement-gem-shimmer'
              )
            : !locked && 'border-white/20 bg-slate-900/80'
        )}
        style={{ width: s.inner, height: s.inner }}
      >
        <span role="img" aria-hidden className={locked ? 'opacity-40' : ''}>
          {icon}
        </span>
        {frame && !locked && (
          <span
            className={cn(
              'absolute -right-1 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/30 px-1 font-bold text-white shadow-md',
              s.badge,
              frame === 'bronze' &&
                'bg-gradient-to-br from-amber-800 to-amber-600',
              frame === 'silver' &&
                'bg-gradient-to-br from-slate-500 to-slate-300 text-slate-900',
              frame === 'gold' &&
                'bg-gradient-to-br from-yellow-600 to-yellow-300 text-amber-950',
              isGemFrame(frame) && gemBadgeClass[frame]
            )}
          >
            {frameBadge[frame]}
          </span>
        )}
      </div>
    </div>
  )
}
