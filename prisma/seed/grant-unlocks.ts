import { PrismaClient } from '@prisma/client'

import { grantDemoUnlocks } from '../../src/lib/demo/grant-unlocks'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] ?? 'axel.lapierre@majoli.io'

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })

  if (!user) {
    console.error(`No user found for email: ${email}`)
    process.exit(1)
  }

  const result = await grantDemoUnlocks(prisma, user.id)

  console.log(
    `Granted ${result.themes} themes and ${result.achievements} achievements (level ${result.level}, ${result.gold} gold) to ${user.email}`
  )
}

main()
  .catch((e) => {
    console.error('Grant unlocks failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
