import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/sounds')
mkdirSync(outDir, { recursive: true })

const SAMPLE_RATE = 44100

function writeWav(filename, { frequency, duration, type = 'sine', volume = 0.3 }) {
  const samples = Math.floor(SAMPLE_RATE * duration)
  const dataSize = samples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE
    const env = Math.min(1, i / (SAMPLE_RATE * 0.01)) * Math.max(0, 1 - (i - samples * 0.7) / (samples * 0.3))
    let sample = 0
    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t)
    } else if (type === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
    } else if (type === 'noise') {
      sample = Math.random() * 2 - 1
    } else if (type === 'chirp') {
      const f = frequency + (frequency * 2 - frequency) * (t / duration)
      sample = Math.sin(2 * Math.PI * f * t)
    } else if (type === 'arpeggio') {
      const notes = [frequency, frequency * 1.25, frequency * 1.5, frequency * 2]
      const noteIdx = Math.floor(t / (duration / notes.length))
      const f = notes[Math.min(noteIdx, notes.length - 1)]
      sample = Math.sin(2 * Math.PI * f * t)
    }
    const val = Math.max(-1, Math.min(1, sample * volume * env))
    buffer.writeInt16LE(Math.floor(val * 32767), 44 + i * 2)
  }

  writeFileSync(join(outDir, filename), buffer)
}

const sounds = {
  'ui-click.wav': { frequency: 800, duration: 0.05, type: 'sine', volume: 0.2 },
  'mission-pop.wav': { frequency: 520, duration: 0.12, type: 'chirp', volume: 0.35 },
  'coin-tick.wav': { frequency: 1200, duration: 0.08, type: 'square', volume: 0.25 },
  'level-up.wav': { frequency: 440, duration: 0.6, type: 'arpeggio', volume: 0.45 },
  'achievement-unlock.wav': { frequency: 330, duration: 0.5, type: 'arpeggio', volume: 0.4 },
  'quest-ready.wav': { frequency: 660, duration: 0.25, type: 'chirp', volume: 0.35 },
  'streak-bonus.wav': { frequency: 280, duration: 0.3, type: 'sine', volume: 0.4 },
  'reward-claim.wav': { frequency: 392, duration: 0.55, type: 'arpeggio', volume: 0.45 },
  'theme-unlock.wav': { frequency: 523, duration: 0.45, type: 'arpeggio', volume: 0.4 },
  'shop-redeem.wav': { frequency: 880, duration: 0.2, type: 'chirp', volume: 0.35 },
  'xp-bonus.wav': { frequency: 740, duration: 0.18, type: 'chirp', volume: 0.35 },
}

for (const [name, opts] of Object.entries(sounds)) {
  writeWav(name, opts)
  console.log(`Generated ${name}`)
}
