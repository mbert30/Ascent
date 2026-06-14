'use client'

import { useCallback, useEffect, useRef } from 'react'

import useSound from 'use-sound'

import {
  ALL_SOUND_IDS,
  SOUND_DEFS,
  type SoundId,
  type SoundTier,
} from '@/lib/juice/sounds'

export { readSoundEnabled, writeSoundEnabled } from '@/lib/juice/prefs'

export function useJuiceSounds(
  soundEnabled: boolean,
  onboardingActive: boolean,
  reducedMotion: boolean
) {
  const playFns = useRef<Partial<Record<SoundId, () => void>>>({})
  const coinDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playUiClick] = useSound(SOUND_DEFS['ui-click'].src, {
    volume: SOUND_DEFS['ui-click'].volume,
    soundEnabled,
  })
  const [playMissionPop] = useSound(SOUND_DEFS['mission-pop'].src, {
    volume: SOUND_DEFS['mission-pop'].volume,
    soundEnabled,
  })
  const [playCoinTick] = useSound(SOUND_DEFS['coin-tick'].src, {
    volume: SOUND_DEFS['coin-tick'].volume,
    soundEnabled,
  })
  const [playLevelUp] = useSound(SOUND_DEFS['level-up'].src, {
    volume: SOUND_DEFS['level-up'].volume,
    soundEnabled,
  })
  const [playAchievementUnlock] = useSound(
    SOUND_DEFS['achievement-unlock'].src,
    { volume: SOUND_DEFS['achievement-unlock'].volume, soundEnabled }
  )
  const [playQuestReady] = useSound(SOUND_DEFS['quest-ready'].src, {
    volume: SOUND_DEFS['quest-ready'].volume,
    soundEnabled,
  })
  const [playStreakBonus] = useSound(SOUND_DEFS['streak-bonus'].src, {
    volume: SOUND_DEFS['streak-bonus'].volume,
    soundEnabled,
  })
  const [playRewardClaim] = useSound(SOUND_DEFS['reward-claim'].src, {
    volume: SOUND_DEFS['reward-claim'].volume,
    soundEnabled,
  })
  const [playThemeUnlock] = useSound(SOUND_DEFS['theme-unlock'].src, {
    volume: SOUND_DEFS['theme-unlock'].volume,
    soundEnabled,
  })
  const [playShopRedeem] = useSound(SOUND_DEFS['shop-redeem'].src, {
    volume: SOUND_DEFS['shop-redeem'].volume,
    soundEnabled,
  })
  const [playXpBonus] = useSound(SOUND_DEFS['xp-bonus'].src, {
    volume: SOUND_DEFS['xp-bonus'].volume,
    soundEnabled,
  })

  useEffect(() => {
    playFns.current = {
      'ui-click': playUiClick,
      'mission-pop': playMissionPop,
      'coin-tick': playCoinTick,
      'level-up': playLevelUp,
      'achievement-unlock': playAchievementUnlock,
      'quest-ready': playQuestReady,
      'streak-bonus': playStreakBonus,
      'reward-claim': playRewardClaim,
      'theme-unlock': playThemeUnlock,
      'shop-redeem': playShopRedeem,
      'xp-bonus': playXpBonus,
    }
  }, [
    playUiClick,
    playMissionPop,
    playCoinTick,
    playLevelUp,
    playAchievementUnlock,
    playQuestReady,
    playStreakBonus,
    playRewardClaim,
    playThemeUnlock,
    playShopRedeem,
    playXpBonus,
  ])

  const shouldPlayTier = useCallback(
    (tier: SoundTier) => {
      if (!soundEnabled) return false
      if (onboardingActive && tier === 'subtle') return false
      if (reducedMotion && tier === 'loud') return false
      return true
    },
    [soundEnabled, onboardingActive, reducedMotion]
  )

  const playSound = useCallback(
    (id: SoundId) => {
      const tier = SOUND_DEFS[id].tier
      if (!shouldPlayTier(tier)) return
      playFns.current[id]?.()
    },
    [shouldPlayTier]
  )

  const playCoinTickDebounced = useCallback(() => {
    if (!shouldPlayTier('subtle')) return
    if (coinDebounceRef.current) clearTimeout(coinDebounceRef.current)
    coinDebounceRef.current = setTimeout(() => {
      playFns.current['coin-tick']?.()
    }, 150)
  }, [shouldPlayTier])

  const vibrate = useCallback((ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms)
    }
  }, [])

  const confettiIntensity = onboardingActive ? 0.5 : 1

  return {
    playSound,
    playCoinTickDebounced,
    vibrate,
    confettiIntensity,
    preloadIds: ALL_SOUND_IDS,
  }
}
