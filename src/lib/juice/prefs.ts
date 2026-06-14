const SOUND_KEY = 'ascent:soundEnabled'
const ANIMATIONS_KEY = 'ascent:animationsEnabled'

export function readSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(SOUND_KEY)
  if (stored === null) return true
  return stored === 'true'
}

export function writeSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SOUND_KEY, String(enabled))
}

export function readAnimationsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(ANIMATIONS_KEY)
  if (stored === null) return true
  return stored === 'true'
}

export function writeAnimationsEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ANIMATIONS_KEY, String(enabled))
}
