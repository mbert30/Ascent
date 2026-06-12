import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// En dev, limiter les connexions par instance pour éviter d'épuiser le pool
// (plusieurs workers Next.js/Turbopack peuvent coexister)
function getDatasourceUrl(): string | undefined {
  if (process.env.NODE_ENV !== 'development' || !process.env.DATABASE_URL)
    return undefined
  const url = process.env.DATABASE_URL
  if (url.includes('connection_limit=')) return undefined
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connection_limit=5`
}

const datasourceUrl = getDatasourceUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    ...(datasourceUrl && {
      datasources: { db: { url: datasourceUrl } },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
