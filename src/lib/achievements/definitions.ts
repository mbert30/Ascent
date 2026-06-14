export type AchievementFrame =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'diamond'
  | 'ruby'
  | 'emerald'
  | 'sapphire'
  | 'amethyst'
  | 'topaz'

export type AchievementMetric =
  | 'streak'
  | 'missions_completed'
  | 'level'
  | 'gold_earned'
  | 'daily_quest_claimed'
  | 'shop_redeems'
  | 'active_days'
  | 'total_xp'
  | 'daily_login_claimed'
  | 'weekly_missions'
  | 'goals_completed'
  | 'habit_completions'
  | 'perfect_days'
  | 'custom_rewards_created'
  | 'streak_freezes_used'

export type AchievementTierDef = {
  tier: 1 | 2 | 3 | 4
  threshold: number
  frame: AchievementFrame
  icon: string
  gold: number
  xp: number
}

export type AchievementDef = {
  id: string
  nameKey: string
  descriptionKey: string
  icon: string
  metric: AchievementMetric
  tiers: AchievementTierDef[]
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'streak_master',
    nameKey: 'streakMaster.name',
    descriptionKey: 'streakMaster.description',
    icon: '🔥',
    metric: 'streak',
    tiers: [
      { tier: 1, threshold: 3, frame: 'bronze', icon: '🔥', gold: 25, xp: 30 },
      { tier: 2, threshold: 7, frame: 'silver', icon: '🔥', gold: 75, xp: 100 },
      { tier: 3, threshold: 14, frame: 'gold', icon: '🔥', gold: 200, xp: 250 },
      { tier: 4, threshold: 30, frame: 'ruby', icon: '🔥', gold: 350, xp: 400 },
    ],
  },
  {
    id: 'mission_hunter',
    nameKey: 'missionHunter.name',
    descriptionKey: 'missionHunter.description',
    icon: '🎯',
    metric: 'missions_completed',
    tiers: [
      { tier: 1, threshold: 10, frame: 'bronze', icon: '🎯', gold: 30, xp: 50 },
      {
        tier: 2,
        threshold: 50,
        frame: 'silver',
        icon: '🎯',
        gold: 100,
        xp: 150,
      },
      {
        tier: 3,
        threshold: 100,
        frame: 'gold',
        icon: '🎯',
        gold: 250,
        xp: 300,
      },
      {
        tier: 4,
        threshold: 250,
        frame: 'emerald',
        icon: '🎯',
        gold: 400,
        xp: 450,
      },
    ],
  },
  {
    id: 'rising_star',
    nameKey: 'risingStar.name',
    descriptionKey: 'risingStar.description',
    icon: '⭐',
    metric: 'level',
    tiers: [
      { tier: 1, threshold: 3, frame: 'bronze', icon: '⭐', gold: 40, xp: 0 },
      { tier: 2, threshold: 5, frame: 'silver', icon: '⭐', gold: 100, xp: 0 },
      { tier: 3, threshold: 10, frame: 'gold', icon: '⭐', gold: 300, xp: 0 },
      { tier: 4, threshold: 20, frame: 'topaz', icon: '⭐', gold: 500, xp: 0 },
    ],
  },
  {
    id: 'gold_collector',
    nameKey: 'goldCollector.name',
    descriptionKey: 'goldCollector.description',
    icon: '🪙',
    metric: 'gold_earned',
    tiers: [
      {
        tier: 1,
        threshold: 200,
        frame: 'bronze',
        icon: '🪙',
        gold: 50,
        xp: 25,
      },
      {
        tier: 2,
        threshold: 1000,
        frame: 'silver',
        icon: '🪙',
        gold: 150,
        xp: 75,
      },
      {
        tier: 3,
        threshold: 3000,
        frame: 'gold',
        icon: '🪙',
        gold: 400,
        xp: 150,
      },
      {
        tier: 4,
        threshold: 10000,
        frame: 'diamond',
        icon: '🪙',
        gold: 600,
        xp: 200,
      },
    ],
  },
  {
    id: 'daily_quest_hero',
    nameKey: 'dailyQuestHero.name',
    descriptionKey: 'dailyQuestHero.description',
    icon: '⚡',
    metric: 'daily_quest_claimed',
    tiers: [
      { tier: 1, threshold: 3, frame: 'bronze', icon: '⚡', gold: 35, xp: 40 },
      {
        tier: 2,
        threshold: 10,
        frame: 'silver',
        icon: '⚡',
        gold: 90,
        xp: 100,
      },
      { tier: 3, threshold: 30, frame: 'gold', icon: '⚡', gold: 220, xp: 200 },
      {
        tier: 4,
        threshold: 75,
        frame: 'sapphire',
        icon: '⚡',
        gold: 350,
        xp: 300,
      },
    ],
  },
  {
    id: 'reward_spender',
    nameKey: 'rewardSpender.name',
    descriptionKey: 'rewardSpender.description',
    icon: '🛍️',
    metric: 'shop_redeems',
    tiers: [
      { tier: 1, threshold: 1, frame: 'bronze', icon: '🛍️', gold: 20, xp: 20 },
      { tier: 2, threshold: 5, frame: 'silver', icon: '🛍️', gold: 80, xp: 60 },
      { tier: 3, threshold: 15, frame: 'gold', icon: '🛍️', gold: 180, xp: 120 },
      {
        tier: 4,
        threshold: 35,
        frame: 'amethyst',
        icon: '🛍️',
        gold: 280,
        xp: 180,
      },
    ],
  },
  {
    id: 'consistency',
    nameKey: 'consistency.name',
    descriptionKey: 'consistency.description',
    icon: '📅',
    metric: 'active_days',
    tiers: [
      { tier: 1, threshold: 7, frame: 'bronze', icon: '📅', gold: 40, xp: 50 },
      {
        tier: 2,
        threshold: 30,
        frame: 'silver',
        icon: '📅',
        gold: 120,
        xp: 120,
      },
      { tier: 3, threshold: 90, frame: 'gold', icon: '📅', gold: 350, xp: 300 },
      {
        tier: 4,
        threshold: 200,
        frame: 'diamond',
        icon: '📅',
        gold: 500,
        xp: 450,
      },
    ],
  },
  {
    id: 'xp_legend',
    nameKey: 'xpLegend.name',
    descriptionKey: 'xpLegend.description',
    icon: '✨',
    metric: 'total_xp',
    tiers: [
      { tier: 1, threshold: 500, frame: 'bronze', icon: '✨', gold: 30, xp: 0 },
      {
        tier: 2,
        threshold: 2000,
        frame: 'silver',
        icon: '✨',
        gold: 100,
        xp: 0,
      },
      { tier: 3, threshold: 5000, frame: 'gold', icon: '✨', gold: 250, xp: 0 },
      {
        tier: 4,
        threshold: 15000,
        frame: 'topaz',
        icon: '✨',
        gold: 400,
        xp: 0,
      },
    ],
  },
  {
    id: 'daily_login',
    nameKey: 'dailyLogin.name',
    descriptionKey: 'dailyLogin.description',
    icon: '🌅',
    metric: 'daily_login_claimed',
    tiers: [
      { tier: 1, threshold: 3, frame: 'bronze', icon: '🌅', gold: 25, xp: 30 },
      { tier: 2, threshold: 7, frame: 'silver', icon: '🌅', gold: 70, xp: 80 },
      { tier: 3, threshold: 14, frame: 'gold', icon: '🌅', gold: 180, xp: 150 },
      { tier: 4, threshold: 30, frame: 'ruby', icon: '🌅', gold: 280, xp: 220 },
    ],
  },
  {
    id: 'weekly_grinder',
    nameKey: 'weeklyGrinder.name',
    descriptionKey: 'weeklyGrinder.description',
    icon: '💪',
    metric: 'weekly_missions',
    tiers: [
      { tier: 1, threshold: 15, frame: 'bronze', icon: '💪', gold: 35, xp: 45 },
      {
        tier: 2,
        threshold: 35,
        frame: 'silver',
        icon: '💪',
        gold: 95,
        xp: 110,
      },
      { tier: 3, threshold: 70, frame: 'gold', icon: '💪', gold: 240, xp: 220 },
      {
        tier: 4,
        threshold: 150,
        frame: 'emerald',
        icon: '💪',
        gold: 380,
        xp: 350,
      },
    ],
  },
  {
    id: 'goal_getter',
    nameKey: 'goalGetter.name',
    descriptionKey: 'goalGetter.description',
    icon: '🏁',
    metric: 'goals_completed',
    tiers: [
      { tier: 1, threshold: 3, frame: 'bronze', icon: '🏁', gold: 30, xp: 40 },
      {
        tier: 2,
        threshold: 15,
        frame: 'silver',
        icon: '🏁',
        gold: 90,
        xp: 100,
      },
      { tier: 3, threshold: 40, frame: 'gold', icon: '🏁', gold: 220, xp: 200 },
      {
        tier: 4,
        threshold: 100,
        frame: 'sapphire',
        icon: '🏁',
        gold: 350,
        xp: 320,
      },
    ],
  },
  {
    id: 'habit_machine',
    nameKey: 'habitMachine.name',
    descriptionKey: 'habitMachine.description',
    icon: '🔄',
    metric: 'habit_completions',
    tiers: [
      { tier: 1, threshold: 15, frame: 'bronze', icon: '🔄', gold: 35, xp: 45 },
      {
        tier: 2,
        threshold: 60,
        frame: 'silver',
        icon: '🔄',
        gold: 100,
        xp: 120,
      },
      {
        tier: 3,
        threshold: 150,
        frame: 'gold',
        icon: '🔄',
        gold: 260,
        xp: 250,
      },
      {
        tier: 4,
        threshold: 350,
        frame: 'amethyst',
        icon: '🔄',
        gold: 400,
        xp: 380,
      },
    ],
  },
  {
    id: 'perfect_day',
    nameKey: 'perfectDay.name',
    descriptionKey: 'perfectDay.description',
    icon: '💯',
    metric: 'perfect_days',
    tiers: [
      { tier: 1, threshold: 2, frame: 'bronze', icon: '💯', gold: 40, xp: 50 },
      {
        tier: 2,
        threshold: 10,
        frame: 'silver',
        icon: '💯',
        gold: 110,
        xp: 130,
      },
      { tier: 3, threshold: 30, frame: 'gold', icon: '💯', gold: 280, xp: 280 },
      {
        tier: 4,
        threshold: 75,
        frame: 'diamond',
        icon: '💯',
        gold: 420,
        xp: 400,
      },
    ],
  },
  {
    id: 'reward_creator',
    nameKey: 'rewardCreator.name',
    descriptionKey: 'rewardCreator.description',
    icon: '🎨',
    metric: 'custom_rewards_created',
    tiers: [
      { tier: 1, threshold: 1, frame: 'bronze', icon: '🎨', gold: 25, xp: 25 },
      { tier: 2, threshold: 3, frame: 'silver', icon: '🎨', gold: 70, xp: 70 },
      { tier: 3, threshold: 8, frame: 'gold', icon: '🎨', gold: 180, xp: 150 },
      {
        tier: 4,
        threshold: 20,
        frame: 'topaz',
        icon: '🎨',
        gold: 280,
        xp: 220,
      },
    ],
  },
  {
    id: 'freeze_saver',
    nameKey: 'freezeSaver.name',
    descriptionKey: 'freezeSaver.description',
    icon: '🧊',
    metric: 'streak_freezes_used',
    tiers: [
      { tier: 1, threshold: 1, frame: 'bronze', icon: '🧊', gold: 30, xp: 30 },
      { tier: 2, threshold: 3, frame: 'silver', icon: '🧊', gold: 80, xp: 80 },
      { tier: 3, threshold: 8, frame: 'gold', icon: '🧊', gold: 200, xp: 180 },
      {
        tier: 4,
        threshold: 20,
        frame: 'sapphire',
        icon: '🧊',
        gold: 320,
        xp: 280,
      },
    ],
  },
]

export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export const TOTAL_ACHIEVEMENT_TIERS = ACHIEVEMENTS.reduce(
  (sum, a) => sum + a.tiers.length,
  0
)
