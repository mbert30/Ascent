import { z } from 'zod'

import {
  cuidSchema,
  goldSchema,
  optionalNullableString,
  xpSchema,
} from './shared'

const baseProfileSchema = z.object({
  email: z.email('Email is not valid'),
  bio: optionalNullableString(280),
  themeId: z.string().optional(),
})

const gamificationSchema = z.object({
  level: z.number().int().min(1).max(1_000).default(1),
  xp: xpSchema,
  currency: goldSchema,
  streakFreeze: z.number().int().min(0).max(10).default(0),
})

export const userCreateSchema = baseProfileSchema.extend({
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(32, 'Password must be 32 characters or less'),
})

export const userUpdateSchema = baseProfileSchema
  .partial()
  .extend(gamificationSchema.partial().shape)
  .extend({
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters')
      .max(32, 'Password must be 32 characters or less')
      .optional(),
  })

export const userIdentifierSchema = z.object({
  userId: cuidSchema,
})

export const userGamificationSchema = gamificationSchema
