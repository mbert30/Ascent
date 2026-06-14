import type { CelebrationEvent } from './types'

const DEDUPE_WINDOW_MS = 2000

export function shouldSkipEvent(
  event: CelebrationEvent,
  recentKeys: Map<string, number>,
  now: number
): boolean {
  const last = recentKeys.get(event.dedupeKey)
  if (last != null && now - last < DEDUPE_WINDOW_MS) {
    return true
  }
  recentKeys.set(event.dedupeKey, now)
  return false
}

export function enqueueUnique(
  queue: CelebrationEvent[],
  event: CelebrationEvent,
  recentKeys: Map<string, number>
): CelebrationEvent[] {
  const now = Date.now()
  if (shouldSkipEvent(event, recentKeys, now)) {
    return queue
  }
  return [...queue, event]
}

export function enqueueManyUnique(
  queue: CelebrationEvent[],
  events: CelebrationEvent[],
  recentKeys: Map<string, number>
): CelebrationEvent[] {
  return events.reduce(
    (acc, event) => enqueueUnique(acc, event, recentKeys),
    queue
  )
}
