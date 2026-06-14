export type OnboardingAdvanceEvent =
  | 'next'
  | 'mission-created'
  | 'reward-created'
  | 'tutorial-completed'
  | 'navigate-shop'
  | 'navigate-dashboard'
  | 'level-modal-opened'
  | 'streak-modal-opened'
  | 'day-picker-opened'
  | 'daily-login-claimed'
  | 'level-reward-claimed'
  | 'navigate-achievements'
  | 'theme-picker-opened'

export type OnboardingRoute = 'dashboard' | 'shop' | 'achievements'

export type OnboardingStep = {
  id: string
  type: 'modal' | 'spotlight'
  target?: string
  titleKey: string
  bodyKey: string
  ctaKey?: string
  advanceOn: OnboardingAdvanceEvent
  route: OnboardingRoute
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    titleKey: 'welcome.title',
    bodyKey: 'welcome.body',
    ctaKey: 'welcome.cta',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'player-bar',
    type: 'spotlight',
    target: 'player-bar',
    titleKey: 'playerBar.title',
    bodyKey: 'playerBar.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'theme',
    type: 'spotlight',
    target: 'theme',
    titleKey: 'theme.title',
    bodyKey: 'theme.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'daily-login',
    type: 'spotlight',
    target: 'daily-login-claim',
    titleKey: 'dailyLogin.title',
    bodyKey: 'dailyLogin.body',
    advanceOn: 'daily-login-claimed',
    route: 'dashboard',
  },
  {
    id: 'streak',
    type: 'spotlight',
    target: 'streak',
    titleKey: 'streak.title',
    bodyKey: 'streak.body',
    advanceOn: 'streak-modal-opened',
    route: 'dashboard',
  },
  {
    id: 'streak-modal',
    type: 'spotlight',
    target: 'streak-modal',
    titleKey: 'streakModal.title',
    bodyKey: 'streakModal.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'achievements',
    type: 'spotlight',
    target: 'achievements',
    titleKey: 'achievementsNav.title',
    bodyKey: 'achievementsNav.body',
    advanceOn: 'navigate-achievements',
    route: 'dashboard',
  },
  {
    id: 'achievements-page',
    type: 'spotlight',
    target: 'achievements-back',
    titleKey: 'achievementsPage.title',
    bodyKey: 'achievementsPage.body',
    advanceOn: 'navigate-dashboard',
    route: 'achievements',
  },
  {
    id: 'gold',
    type: 'spotlight',
    target: 'gold',
    titleKey: 'gold.title',
    bodyKey: 'gold.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'day-picker',
    type: 'spotlight',
    target: 'day-picker',
    titleKey: 'dayPicker.title',
    bodyKey: 'dayPicker.body',
    advanceOn: 'day-picker-opened',
    route: 'dashboard',
  },
  {
    id: 'missions',
    type: 'spotlight',
    target: 'missions',
    titleKey: 'missions.title',
    bodyKey: 'missions.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'add-mission',
    type: 'spotlight',
    target: 'add-mission',
    titleKey: 'addMission.title',
    bodyKey: 'addMission.body',
    advanceOn: 'mission-created',
    route: 'dashboard',
  },
  {
    id: 'habit-repeat',
    type: 'spotlight',
    target: 'missions',
    titleKey: 'habitRepeat.title',
    bodyKey: 'habitRepeat.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'daily-quest',
    type: 'spotlight',
    target: 'daily-quest',
    titleKey: 'dailyQuest.title',
    bodyKey: 'dailyQuest.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'shop-nav',
    type: 'spotlight',
    target: 'gold',
    titleKey: 'shopNav.title',
    bodyKey: 'shopNav.body',
    advanceOn: 'navigate-shop',
    route: 'dashboard',
  },
  {
    id: 'create-reward',
    type: 'spotlight',
    target: 'create-reward',
    titleKey: 'createReward.title',
    bodyKey: 'createReward.body',
    advanceOn: 'reward-created',
    route: 'shop',
  },
  {
    id: 'back-dashboard',
    type: 'spotlight',
    target: 'back-dashboard',
    titleKey: 'backDashboard.title',
    bodyKey: 'backDashboard.body',
    advanceOn: 'navigate-dashboard',
    route: 'shop',
  },
  {
    id: 'complete-tutorial',
    type: 'spotlight',
    target: 'tutorial-mission',
    titleKey: 'completeTutorial.title',
    bodyKey: 'completeTutorial.body',
    advanceOn: 'tutorial-completed',
    route: 'dashboard',
  },
  {
    id: 'claim-level',
    type: 'spotlight',
    target: 'level',
    titleKey: 'claimLevel.title',
    bodyKey: 'claimLevel.body',
    advanceOn: 'level-modal-opened',
    route: 'dashboard',
  },
  {
    id: 'claim-level-modal',
    type: 'spotlight',
    target: 'level-claim',
    titleKey: 'claimLevelModal.title',
    bodyKey: 'claimLevelModal.body',
    advanceOn: 'level-reward-claimed',
    route: 'dashboard',
  },
  {
    id: 'choose-theme',
    type: 'spotlight',
    target: 'theme',
    titleKey: 'chooseTheme.title',
    bodyKey: 'chooseTheme.body',
    advanceOn: 'theme-picker-opened',
    route: 'dashboard',
  },
  {
    id: 'done',
    type: 'modal',
    titleKey: 'done.title',
    bodyKey: 'done.body',
    ctaKey: 'done.cta',
    advanceOn: 'next',
    route: 'dashboard',
  },
]
