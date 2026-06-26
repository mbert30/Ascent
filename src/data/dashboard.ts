/** Fallback values shown before /api/user/me loads on the dashboard. */
export const dashboardData = {
  user: {
    level: 1,
  },
  levels: [
    { level: 1, xpRequired: 0, reward: { gold: 15, title: 'First Steps' } },
    {
      level: 2,
      xpRequired: 50,
      reward: { gold: 20, title: 'Getting Started' },
    },
    {
      level: 3,
      xpRequired: 125,
      reward: { gold: 25, title: 'Building Momentum' },
    },
    { level: 4, xpRequired: 225, reward: { gold: 30, title: 'On Track' } },
    {
      level: 5,
      xpRequired: 375,
      reward: { gold: 35, title: 'Making Progress' },
    },
    { level: 6, xpRequired: 575, reward: { gold: 40, title: 'Halfway There' } },
    { level: 7, xpRequired: 850, reward: { gold: 50, title: 'Steady Climb' } },
    { level: 8, xpRequired: 1200, reward: { gold: 60, title: 'Rising Star' } },
    {
      level: 9,
      xpRequired: 1650,
      reward: { gold: 70, title: 'Gaining Speed' },
    },
    {
      level: 10,
      xpRequired: 2200,
      reward: { gold: 80, title: 'Double Digits' },
    },
    {
      level: 11,
      xpRequired: 2900,
      reward: { gold: 100, title: 'Eleven Strong' },
    },
    {
      level: 12,
      xpRequired: 3500,
      reward: { gold: 120, title: 'Dozen Delight' },
    },
    {
      level: 13,
      xpRequired: 5000,
      reward: { gold: 150, title: 'Lucky Thirteen' },
    },
    {
      level: 14,
      xpRequired: 7000,
      reward: { gold: 180, title: 'Fourteen Focus' },
    },
    {
      level: 15,
      xpRequired: 9500,
      reward: { gold: 220, title: 'Fifteen Fierce' },
    },
    {
      level: 16,
      xpRequired: 12000,
      reward: { gold: 260, title: 'Sweet Sixteen' },
    },
    {
      level: 17,
      xpRequired: 15000,
      reward: { gold: 300, title: 'Seventeen Strong' },
    },
    {
      level: 18,
      xpRequired: 18500,
      reward: { gold: 350, title: 'Eighteen Elite' },
    },
    {
      level: 19,
      xpRequired: 22500,
      reward: { gold: 400, title: 'Nineteen Noble' },
    },
    {
      level: 20,
      xpRequired: 27000,
      reward: { gold: 500, title: 'Twenty Triumph' },
    },
  ],
  overview: {
    summary: {
      level: 1,
      currentXP: 0,
      gold: 0,
    },
  },
} as const
