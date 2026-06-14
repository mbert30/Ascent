import type { AchievementFrame } from '@/lib/achievements/definitions'

export type ConfettiTheme =
  | 'gold'
  | 'purple'
  | 'indigo'
  | 'green'
  | 'orange'
  | 'sparkle'

export type AchievementUnlockPayload = {
  achievementId: string
  nameKey: string
  icon: string
  frame: AchievementFrame
  tier: number
  gold: number
  xp: number
}

export type ShopRedeemPayload = {
  title: string
  icon: string | null
  cost: number
}

export type FloatingRewardPayload = {
  id: string
  label: string
  kind: 'xp' | 'gold'
  originX: number
  originY: number
}

export type CelebrationEvent =
  | {
      type: 'level_up_banner'
      level: number
      dedupeKey: string
    }
  | {
      type: 'achievement_unlock'
      data: AchievementUnlockPayload
      dedupeKey: string
    }
  | {
      type: 'theme_unlock'
      themeId: string
      dedupeKey: string
    }
  | {
      type: 'shop_redeem'
      data: ShopRedeemPayload
      dedupeKey: string
    }
  | {
      type: 'daily_quest_ready'
      dedupeKey: string
    }
  | {
      type: 'idle_callback'
      callback: () => void
      dedupeKey: string
    }
