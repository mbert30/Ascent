export type SoundId =
  | 'ui-click'
  | 'mission-pop'
  | 'coin-tick'
  | 'level-up'
  | 'achievement-unlock'
  | 'quest-ready'
  | 'streak-bonus'
  | 'reward-claim'
  | 'theme-unlock'
  | 'shop-redeem'
  | 'xp-bonus'

export type SoundTier = 'subtle' | 'medium' | 'loud'

export type SoundDef = {
  src: string
  tier: SoundTier
  volume: number
}

export const SOUND_DEFS: Record<SoundId, SoundDef> = {
  'ui-click': { src: '/sounds/ui-click.wav', tier: 'subtle', volume: 0.25 },
  'mission-pop': {
    src: '/sounds/mission-pop.wav',
    tier: 'subtle',
    volume: 0.35,
  },
  'coin-tick': { src: '/sounds/coin-tick.wav', tier: 'subtle', volume: 0.3 },
  'level-up': { src: '/sounds/level-up.wav', tier: 'loud', volume: 0.55 },
  'achievement-unlock': {
    src: '/sounds/achievement-unlock.wav',
    tier: 'loud',
    volume: 0.5,
  },
  'quest-ready': {
    src: '/sounds/quest-ready.wav',
    tier: 'medium',
    volume: 0.4,
  },
  'streak-bonus': {
    src: '/sounds/streak-bonus.wav',
    tier: 'medium',
    volume: 0.45,
  },
  'reward-claim': {
    src: '/sounds/reward-claim.wav',
    tier: 'loud',
    volume: 0.5,
  },
  'theme-unlock': {
    src: '/sounds/theme-unlock.wav',
    tier: 'loud',
    volume: 0.5,
  },
  'shop-redeem': {
    src: '/sounds/shop-redeem.wav',
    tier: 'medium',
    volume: 0.45,
  },
  'xp-bonus': { src: '/sounds/xp-bonus.wav', tier: 'medium', volume: 0.4 },
}

export const ALL_SOUND_IDS = Object.keys(SOUND_DEFS) as SoundId[]
