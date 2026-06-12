import { z } from 'zod'

export const missionTypeEnum = z.enum(['HABIT', 'GOAL'])
export const missionStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'OVERDUE'])
export const missionRepeatEnum = z.enum(['NONE', 'DAILY', 'WEEKLY'])

export const createMissionSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  type: missionTypeEnum,
  xp: z.number().int().min(0).max(1000),
  dueAt: z.string().datetime(),
  repeat: missionRepeatEnum.optional(),
  repeatCount: z.number().int().min(1).max(31).optional(),
})

export const updateMissionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  type: missionTypeEnum.optional(),
  xp: z.number().int().min(0).max(1000).optional(),
  dueAt: z.string().datetime().optional(),
  status: missionStatusEnum.optional(),
})

export type CreateMissionInput = z.infer<typeof createMissionSchema>
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>
