'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { AnimatePresence, motion } from 'framer-motion'

import {
  type AchievementUnlockData,
  AchievementUnlockModal,
} from '@/components/achievements/AchievementUnlockModal'

import { getAchievementById } from '@/lib/achievements/definitions'
import {
  readAnimationsEnabled,
  readSoundEnabled,
  writeAnimationsEnabled,
  writeSoundEnabled,
} from '@/lib/juice/prefs'
import { enqueueManyUnique, enqueueUnique } from '@/lib/juice/queue'
import type {
  AchievementUnlockPayload,
  CelebrationEvent,
  ConfettiTheme,
  FloatingRewardPayload,
  ShopRedeemPayload,
} from '@/lib/juice/types'
import type { PendingRewardType } from '@/lib/pending-rewards'

import { burstConfetti, burstConfettiSubtle } from './ConfettiBurst'
import { FloatingReward } from './FloatingReward'
import { LevelUpBanner } from './LevelUpBanner'
import { ShopRedeemCelebration } from './ShopRedeemCelebration'
import { JuiceContext, type JuiceContextValue } from './useJuice'
import { useJuiceSounds } from './useJuiceSounds'

type JuiceProviderProps = {
  children: React.ReactNode
}

const REWARD_CONFETTI: Record<PendingRewardType, ConfettiTheme> = {
  LEVEL_UP: 'indigo',
  ACHIEVEMENT: 'purple',
  DAILY_LOGIN: 'green',
  DAILY_QUEST: 'green',
}

export function JuiceProvider({ children }: JuiceProviderProps) {
  const t = useTranslations('juice')
  const [soundEnabled, setSoundEnabledState] = useState(() =>
    readSoundEnabled()
  )
  const [animationsEnabled, setAnimationsEnabledState] = useState(() =>
    readAnimationsEnabled()
  )
  const [osReducedMotion, setOsReducedMotion] = useState(false)
  const [onboardingActive, setOnboardingActive] = useState(false)

  const reducedMotion = osReducedMotion || !animationsEnabled

  const [queue, setQueue] = useState<CelebrationEvent[]>([])
  const [processing, setProcessing] = useState(false)
  const recentKeysRef = useRef(new Map<string, number>())

  const [levelUpBannerLevel, setLevelUpBannerLevel] = useState<number | null>(
    null
  )
  const [achievementUnlock, setAchievementUnlock] =
    useState<AchievementUnlockPayload | null>(null)
  const [shopRedeem, setShopRedeem] = useState<ShopRedeemPayload | null>(null)
  const [dailyQuestToast, setDailyQuestToast] = useState(false)
  const [floatingRewards, setFloatingRewards] = useState<
    FloatingRewardPayload[]
  >([])

  const idleCallbacksRef = useRef<Array<() => void>>([])
  const themeUnlockHandlerRef = useRef<((themeId: string) => void) | null>(null)
  const [playerBarTarget, setPlayerBarTarget] = useState({ x: 0, y: 0 })

  const { playSound, playCoinTickDebounced, vibrate, confettiIntensity } =
    useJuiceSounds(soundEnabled, onboardingActive, reducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setOsReducedMotion(mq.matches)
    updateMotion()
    mq.addEventListener('change', updateMotion)
    return () => mq.removeEventListener('change', updateMotion)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduced-motion')
    }
    return () => {
      document.documentElement.removeAttribute('data-reduced-motion')
    }
  }, [reducedMotion])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled)
    writeSoundEnabled(enabled)
  }, [])

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabledState(enabled)
    writeAnimationsEnabled(enabled)
  }, [])

  const updatePlayerBarTarget = useCallback(() => {
    const el = document.querySelector('[data-player-bar-target]')
    if (el) {
      const rect = el.getBoundingClientRect()
      setPlayerBarTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
  }, [])

  const removeFloatingReward = useCallback((id: string) => {
    setFloatingRewards((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const burstThemed = useCallback(
    (theme: ConfettiTheme, subtle = false) => {
      if (subtle) {
        burstConfettiSubtle(theme, confettiIntensity, reducedMotion)
      } else {
        burstConfetti(theme, confettiIntensity, reducedMotion)
      }
    },
    [confettiIntensity, reducedMotion]
  )

  const advanceQueue = useCallback(() => {
    setProcessing(false)
    setQueue((prev) => prev.slice(1))
  }, [])

  const processEvent = useCallback(
    (event: CelebrationEvent) => {
      setProcessing(true)
      switch (event.type) {
        case 'level_up_banner':
          setLevelUpBannerLevel(event.level)
          playSound('level-up')
          burstThemed('gold')
          vibrate(15)
          setTimeout(advanceQueue, reducedMotion ? 800 : 1500)
          break
        case 'achievement_unlock':
          setAchievementUnlock(event.data)
          playSound('achievement-unlock')
          burstThemed('purple')
          vibrate(12)
          break
        case 'theme_unlock':
          burstThemed('sparkle')
          themeUnlockHandlerRef.current?.(event.themeId)
          break
        case 'shop_redeem':
          setShopRedeem(event.data)
          playSound('shop-redeem')
          burstThemed('green', true)
          break
        case 'daily_quest_ready':
          setDailyQuestToast(true)
          playSound('quest-ready')
          burstThemed('green', true)
          setTimeout(() => {
            setDailyQuestToast(false)
            advanceQueue()
          }, 2200)
          break
        case 'idle_callback':
          event.callback()
          advanceQueue()
          break
        default:
          advanceQueue()
      }
    },
    [advanceQueue, burstThemed, playSound, reducedMotion, vibrate]
  )

  useEffect(() => {
    if (processing || queue.length === 0) return
    const timer = window.setTimeout(() => processEvent(queue[0]), 0)
    return () => window.clearTimeout(timer)
  }, [queue, processing, processEvent])

  useEffect(() => {
    if (!processing && queue.length === 0) {
      const callbacks = [...idleCallbacksRef.current]
      idleCallbacksRef.current = []
      callbacks.forEach((cb) => cb())
    }
  }, [processing, queue.length])

  const enqueue = useCallback((event: CelebrationEvent) => {
    setQueue((prev) => enqueueUnique(prev, event, recentKeysRef.current))
  }, [])

  const enqueueMany = useCallback((events: CelebrationEvent[]) => {
    setQueue((prev) => enqueueManyUnique(prev, events, recentKeysRef.current))
  }, [])

  const whenQueueIdle = useCallback(
    (callback: () => void) => {
      if (!processing && queue.length === 0) {
        callback()
      } else {
        idleCallbacksRef.current.push(callback)
      }
    },
    [processing, queue.length]
  )

  const registerThemeUnlockHandler = useCallback(
    (handler: ((themeId: string) => void) | null) => {
      themeUnlockHandlerRef.current = handler
    },
    []
  )

  const notifyThemeUnlockClosed = useCallback(() => {
    advanceQueue()
  }, [advanceQueue])

  const dismissLevelUpBanner = useCallback(() => {
    setLevelUpBannerLevel(null)
  }, [])

  const dismissAchievementUnlock = useCallback(() => {
    setAchievementUnlock(null)
    advanceQueue()
  }, [advanceQueue])

  const dismissShopRedeem = useCallback(() => {
    setShopRedeem(null)
    advanceQueue()
  }, [advanceQueue])

  const dismissDailyQuestToast = useCallback(() => {
    setDailyQuestToast(false)
  }, [])

  const playUiClick = useCallback(() => {
    playSound('ui-click')
  }, [playSound])

  const playMissionComplete = useCallback(
    (xp: number, origin?: DOMRect) => {
      playSound('mission-pop')
      vibrate(8)
      updatePlayerBarTarget()
      const ox = origin ? origin.left + origin.width / 2 : window.innerWidth / 2
      const oy = origin
        ? origin.top + origin.height / 2
        : window.innerHeight / 2
      if (xp > 0) {
        setFloatingRewards((prev) => [
          ...prev,
          {
            id: `xp-${Date.now()}`,
            label: `+${xp} XP`,
            kind: 'xp',
            originX: ox,
            originY: oy,
          },
        ])
      }
    },
    [playSound, updatePlayerBarTarget, vibrate]
  )

  const playGoldGain = useCallback(
    (amount: number) => {
      if (amount > 0) {
        playCoinTickDebounced()
      }
    },
    [playCoinTickDebounced]
  )

  const playRewardClaimed = useCallback(
    (type: PendingRewardType) => {
      playSound('reward-claim')
      burstThemed(REWARD_CONFETTI[type] ?? 'gold')
      vibrate(10)
    },
    [burstThemed, playSound, vibrate]
  )

  const playThemeUnlocked = useCallback(() => {
    playSound('theme-unlock')
    burstThemed('sparkle')
  }, [burstThemed, playSound])

  const playStreakBonus = useCallback(() => {
    playSound('streak-bonus')
    burstThemed('orange', true)
  }, [burstThemed, playSound])

  const playXpBonus = useCallback(
    (xp: number) => {
      playSound('xp-bonus')
      updatePlayerBarTarget()
      setFloatingRewards((prev) => [
        ...prev,
        {
          id: `xp-bonus-${Date.now()}`,
          label: `+${xp} XP`,
          kind: 'xp',
          originX: window.innerWidth / 2,
          originY: window.innerHeight - 80,
        },
      ])
    },
    [playSound, updatePlayerBarTarget]
  )

  const achievementModalData: AchievementUnlockData = useMemo(() => {
    if (!achievementUnlock) return null
    const def = getAchievementById(achievementUnlock.achievementId)
    return {
      achievementId: achievementUnlock.achievementId,
      nameKey: def?.nameKey ?? achievementUnlock.nameKey,
      icon: achievementUnlock.icon,
      frame: achievementUnlock.frame,
      tier: achievementUnlock.tier,
      gold: achievementUnlock.gold,
      xp: achievementUnlock.xp,
    }
  }, [achievementUnlock])

  const value: JuiceContextValue = {
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    reducedMotion,
    isQueueIdle: !processing && queue.length === 0,
    playSound,
    playUiClick,
    playMissionComplete,
    playGoldGain,
    playRewardClaimed,
    playThemeUnlocked,
    playStreakBonus,
    playXpBonus,
    burstConfetti: burstThemed,
    vibrate,
    enqueue,
    enqueueMany,
    whenQueueIdle,
    registerThemeUnlockHandler,
    notifyThemeUnlockClosed,
    setOnboardingActive,
    floatingRewards,
    levelUpBannerLevel,
    achievementUnlock,
    shopRedeem,
    dailyQuestToast,
    dismissDailyQuestToast,
  }

  return (
    <JuiceContext.Provider value={value}>
      <div
        data-reduced-motion={reducedMotion ? 'true' : undefined}
        className="contents"
      >
        {children}
      </div>

      <LevelUpBanner
        level={levelUpBannerLevel}
        onDismiss={dismissLevelUpBanner}
        reducedMotion={reducedMotion}
      />

      <AchievementUnlockModal
        data={achievementModalData}
        onClose={dismissAchievementUnlock}
      />

      <ShopRedeemCelebration data={shopRedeem} onClose={dismissShopRedeem} />

      {floatingRewards.map((reward) => (
        <FloatingReward
          key={reward.id}
          reward={reward}
          targetX={playerBarTarget.x}
          targetY={playerBarTarget.y}
          onDone={removeFloatingReward}
          reducedMotion={reducedMotion}
        />
      ))}

      <AnimatePresence>
        {dailyQuestToast && (
          <motion.div
            className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <span className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/40">
              {t('dailyQuestReady')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </JuiceContext.Provider>
  )
}

export function buildAchievementUnlockEvents(
  achievements: Array<{
    achievementId: string
    tier: number
    gold: number
    xp: number
    icon: string
    frame: string
  }>
): CelebrationEvent[] {
  return achievements.map((a) => {
    const def = getAchievementById(a.achievementId)
    return {
      type: 'achievement_unlock' as const,
      data: {
        achievementId: a.achievementId,
        nameKey: def?.nameKey ?? a.achievementId,
        icon: a.icon,
        frame: a.frame as AchievementUnlockPayload['frame'],
        tier: a.tier,
        gold: a.gold,
        xp: a.xp,
      },
      dedupeKey: `ach-${a.achievementId}-${a.tier}`,
    }
  })
}
