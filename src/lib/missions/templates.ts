import type { MissionType } from '@prisma/client'

type MissionSeed = {
  title: string
  category: string
  type: MissionType
  xp: number
  hour: number
}

export const STARTER_MISSION_TEMPLATES: MissionSeed[] = [
  {
    title: 'Hydrate (8 glasses)',
    category: 'Health',
    type: 'HABIT',
    xp: 20,
    hour: 8,
  },
  {
    title: '30 min workout',
    category: 'Fitness',
    type: 'HABIT',
    xp: 45,
    hour: 18,
  },
  {
    title: 'Deep work sprint (45 min)',
    category: 'Productivity',
    type: 'GOAL',
    xp: 60,
    hour: 10,
  },
  {
    title: 'Read 20 minutes',
    category: 'Learning',
    type: 'HABIT',
    xp: 30,
    hour: 21,
  },
]

export function missionTemplatesForDate(): MissionSeed[] {
  return STARTER_MISSION_TEMPLATES.map((template) => ({ ...template }))
}
