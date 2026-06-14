import type { AchievementFrame } from '@/lib/achievements/definitions'

export const GEM_FRAMES = [
  'diamond',
  'ruby',
  'emerald',
  'sapphire',
  'amethyst',
  'topaz',
] as const satisfies readonly AchievementFrame[]

export function isGemFrame(frame: AchievementFrame): boolean {
  return (GEM_FRAMES as readonly string[]).includes(frame)
}

export function achievementInnerClass(frame: AchievementFrame): string {
  return `achievement-inner-${frame}`
}

export function achievementFrameClass(frame: AchievementFrame): string {
  return `achievement-frame-${frame}`
}

export function tierRowClass(
  frame: AchievementFrame,
  unlocked: boolean
): string {
  if (!unlocked) return 'border-white/10 bg-white/[0.03] opacity-60'
  if (frame === 'gold') {
    return 'achievement-inner-gold achievement-frame-gold border-amber-400/50'
  }
  if (frame === 'silver') {
    return 'achievement-inner-silver achievement-frame-silver border-slate-300/40'
  }
  if (frame === 'bronze') {
    return 'achievement-inner-bronze achievement-frame-bronze border-orange-600/40'
  }
  return `${achievementInnerClass(frame)} ${achievementFrameClass(frame)} border-white/30`
}
