'use client'

import { createContext, useContext } from 'react'

import type { SoundId } from '@/lib/juice/sounds'
import type {
  AchievementUnlockPayload,
  CelebrationEvent,
  ConfettiTheme,
  FloatingRewardPayload,
  ShopRedeemPayload,
} from '@/lib/juice/types'
import type { PendingRewardType } from '@/lib/pending-rewards'

export type JuiceContextValue = {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  reducedMotion: boolean
  isQueueIdle: boolean
  playSound: (id: SoundId) => void
  playUiClick: () => void
  playMissionComplete: (xp: number, origin?: DOMRect) => void
  playGoldGain: (amount: number) => void
  playRewardClaimed: (type: PendingRewardType) => void
  playThemeUnlocked: () => void
  playStreakBonus: () => void
  playXpBonus: (xp: number) => void
  burstConfetti: (theme: ConfettiTheme) => void
  vibrate: (ms?: number) => void
  enqueue: (event: CelebrationEvent) => void
  enqueueMany: (events: CelebrationEvent[]) => void
  whenQueueIdle: (callback: () => void) => void
  registerThemeUnlockHandler: (
    handler: ((themeId: string) => void) | null
  ) => void
  notifyThemeUnlockClosed: () => void
  setOnboardingActive: (active: boolean) => void
  floatingRewards: FloatingRewardPayload[]
  levelUpBannerLevel: number | null
  achievementUnlock: AchievementUnlockPayload | null
  shopRedeem: ShopRedeemPayload | null
  dailyQuestToast: boolean
  dismissDailyQuestToast: () => void
}

export const JuiceContext = createContext<JuiceContextValue | null>(null)

export function useJuice(): JuiceContextValue {
  const ctx = useContext(JuiceContext)
  if (!ctx) {
    throw new Error('useJuice must be used within JuiceProvider')
  }
  return ctx
}

export function useJuiceOptional(): JuiceContextValue | null {
  return useContext(JuiceContext)
}
