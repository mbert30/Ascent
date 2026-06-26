import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage des données seed...')

  const seeds = await prisma.user.findMany({
    where: { email: { startsWith: 'seed+' } },
  })
  if (seeds.length === 0) {
    console.log('Aucun utilisateur seed trouvé.')
    return
  }

  for (const u of seeds) {
    await prisma.userReward.deleteMany({ where: { userId: u.id } })
    await prisma.mission.deleteMany({ where: { userId: u.id } })

    await prisma.user.delete({ where: { id: u.id } })
    console.log(`Supprimé: ${u.email}`)
  }

  await prisma.reward.deleteMany({
    where: {
      id: { in: ['seed-reward-focus-music', 'seed-reward-brunch'] },
      usersUnlocked: { none: {} },
    },
  })

  console.log('✔️ Nettoyage seed terminé.')
}

main()
  .catch((e) => {
    console.error('Erreur lors du cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
