import { RewardType } from '@prisma/client'
import { z } from 'zod'

import { cuidSchema, goldSchemaBase, iconSchema } from './shared'

const rewardBaseSchema = z.object({
  title: z.string().min(1).max(80),
  cost: goldSchemaBase.min(0).max(5_000),
  type: z.enum(RewardType),
  icon: iconSchema,
})

export const rewardCreateSchema = rewardBaseSchema.extend({
  creatorId: cuidSchema.optional().nullable(),
})

export const rewardUpdateSchema = rewardBaseSchema.partial()

export const userRewardCreateSchema = z.object({
  userId: cuidSchema,
  rewardId: cuidSchema,
  isConsumed: z.boolean().optional(),
})

export const rewardIdentifierSchema = z.object({
  rewardId: cuidSchema,
})
