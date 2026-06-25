#!/usr/bin/env node
/**
 * Capture UI screenshots for AI visual review.
 *
 * Usage:
 *   npm run screenshots              # dev server must already be running
 *   npm run screenshots -- --wait    # poll until localhost is up (60s)
 *   npm run screenshots -- --serve     # start `npm run dev`, capture, then stop
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT_DIR = path.resolve(ROOT, process.env.SCREENSHOT_DIR ?? 'screenshots/latest')
const WAIT_MS = Number(process.env.SCREENSHOT_WAIT_MS ?? 800)

const args = new Set(process.argv.slice(2))
const shouldWait = args.has('--wait')
const shouldServe = args.has('--serve')

/** @type {{ id: string; path: string; viewport: { width: number; height: number }; fullPage?: boolean }[]} */
const TARGETS = [
  {
    id: 'landing-mobile',
    path: '/en',
    viewport: { width: 390, height: 844 },
    fullPage: true,
  },
  {
    id: 'landing-desktop',
    path: '/en',
    viewport: { width: 1280, height: 800 },
  },
  {
    id: 'login-mobile',
    path: '/en/login',
    viewport: { width: 390, height: 844 },
  },
  {
    id: 'login-desktop',
    path: '/en/login',
    viewport: { width: 1280, height: 800 },
  },
  {
    id: 'landing-mobile-fr',
    path: '/fr',
    viewport: { width: 390, height: 844 },
  },
]

async function isServerUp() {
  try {
    const res = await fetch(BASE_URL, { redirect: 'follow' })
    return res.ok || res.status === 307 || res.status === 308
  } catch {
    return false
  }
}

async function waitForServer(timeoutMs = 90_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp()) {
      return
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(
    `Dev server not reachable at ${BASE_URL} after ${timeoutMs}ms. Run "npm run dev" or use --serve.`
  )
}

/**
 * @returns {Promise<import('node:child_process').ChildProcess | null>}
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'dev'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    })

    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error('Timed out waiting for dev server to start'))
        child.kill('SIGTERM')
      }
    }, 90_000)

    const onData = async () => {
      if (settled) return
      if (await isServerUp()) {
        settled = true
        clearTimeout(timeout)
        resolve(child)
      }
    }

    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.on('error', reject)
    child.on('exit', (code) => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        reject(new Error(`Dev server exited early (code ${code ?? 'unknown'})`))
      }
    })
  })
}

async function captureScreenshots() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const captured = []

  try {
    for (const target of TARGETS) {
      const context = await browser.newContext({
        viewport: target.viewport,
        deviceScaleFactor: 2,
        colorScheme: 'dark',
      })
      const page = await context.newPage()

      const url = `${BASE_URL}${target.path}`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
      await page.waitForTimeout(WAIT_MS)

      const filename = `${target.id}.png`
      const filePath = path.join(OUT_DIR, filename)

      await page.screenshot({
        path: filePath,
        fullPage: target.fullPage ?? false,
      })

      captured.push({
        id: target.id,
        url,
        viewport: target.viewport,
        file: path.relative(ROOT, filePath),
      })

      await context.close()
    }
  } finally {
    await browser.close()
  }

  const manifest = {
    capturedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    outputDir: path.relative(ROOT, OUT_DIR),
    shots: captured,
    agentHint:
      'Read the PNG files in this folder with the Read tool to visually review the UI. Compare layout, spacing, centering, and readability against the task requirements.',
  }

  const manifestPath = path.join(OUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`\nCaptured ${captured.length} screenshots → ${path.relative(ROOT, OUT_DIR)}/`)
  for (const shot of captured) {
    console.log(`  • ${shot.file}`)
  }
  console.log(`  • manifest.json`)
  console.log(
    '\nAgent: read screenshots/latest/*.png and manifest.json to verify the UI.\n'
  )
}

async function main() {
  /** @type {import('node:child_process').ChildProcess | null} */
  let devProcess = null

  try {
    if (shouldServe) {
      if (await isServerUp()) {
        console.log(`Server already running at ${BASE_URL}`)
      } else {
        console.log('Starting dev server…')
        devProcess = await startDevServer()
        console.log(`Dev server ready at ${BASE_URL}`)
      }
    } else if (shouldWait) {
      console.log(`Waiting for ${BASE_URL}…`)
      await waitForServer()
    } else if (!(await isServerUp())) {
      console.error(
        `No server at ${BASE_URL}. Start "npm run dev", or run:\n  npm run screenshots -- --wait\n  npm run screenshots -- --serve`
      )
      process.exit(1)
    }

    await captureScreenshots()
  } finally {
    if (devProcess && !devProcess.killed) {
      devProcess.kill('SIGTERM')
      console.log('Stopped dev server.')
    }
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
