import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_USER_IDS = [
  'cmiivz82k0000enb2xae4e85t',
  'cmmbr1xvk0000maukql7fj948',
  'cmmbrax7100008ksspqfilsdb',
] as const

type Options = {
  userIds: string[]
  addLevels?: number
  setLevel?: number
  addGold?: number
  setGold?: number
  addXp?: number
  setXp?: number
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function parseArgs(argv: string[]): Options {
  const userIds: string[] = []
  let useDemoUsers = false

  let addLevels: number | undefined
  let setLevel: number | undefined
  let addGold: number | undefined
  let setGold: number | undefined
  let addXp: number | undefined
  let setXp: number | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]

    if (arg === '--all-demo') {
      useDemoUsers = true
      continue
    }
    if (arg === '--user-id' && next) {
      userIds.push(next)
      i += 1
      continue
    }
    if (arg === '--add-levels') {
      addLevels = toNumber(next)
      i += 1
      continue
    }
    if (arg === '--set-level') {
      setLevel = toNumber(next)
      i += 1
      continue
    }
    if (arg === '--add-gold') {
      addGold = toNumber(next)
      i += 1
      continue
    }
    if (arg === '--set-gold') {
      setGold = toNumber(next)
      i += 1
      continue
    }
    if (arg === '--add-xp') {
      addXp = toNumber(next)
      i += 1
      continue
    }
    if (arg === '--set-xp') {
      setXp = toNumber(next)
      i += 1
      continue
    }
  }

  if (useDemoUsers) {
    userIds.push(...DEMO_USER_IDS)
  }

  return {
    userIds: Array.from(new Set(userIds)),
    addLevels,
    setLevel,
    addGold,
    setGold,
    addXp,
    setXp,
  }
}

function printUsage() {
  console.log(`
Demo cheats:
  npm run demo:cheat -- --all-demo --add-levels 10 --add-gold 1000
  npm run demo:cheat -- --user-id cmiivz82k0000enb2xae4e85t --set-level 25 --set-gold 5000
  npm run demo:cheat:boost
`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const hasStatChange =
    options.addLevels != null ||
    options.setLevel != null ||
    options.addGold != null ||
    options.setGold != null ||
    options.addXp != null ||
    options.setXp != null

  if (options.userIds.length === 0 || !hasStatChange) {
    printUsage()
    process.exit(1)
  }

  const users = await prisma.user.findMany({
    where: { id: { in: options.userIds } },
    select: { id: true, level: true, currency: true, xp: true },
  })

  if (users.length === 0) {
    console.log('No matching users found.')
    return
  }

  for (const user of users) {
    const nextLevel = Math.max(
      1,
      options.setLevel ?? user.level + (options.addLevels ?? 0)
    )
    const nextGold = Math.max(
      0,
      options.setGold ?? user.currency + (options.addGold ?? 0)
    )
    const nextXp = Math.max(0, options.setXp ?? user.xp + (options.addXp ?? 0))

    await prisma.user.update({
      where: { id: user.id },
      data: { level: nextLevel, currency: nextGold, xp: nextXp },
    })

    console.log(
      `Updated ${user.id}: level ${user.level} -> ${nextLevel}, gold ${user.currency} -> ${nextGold}, xp ${user.xp} -> ${nextXp}`
    )
  }
}

main()
  .catch((e) => {
    console.error('Cheat command failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
