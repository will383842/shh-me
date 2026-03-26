/**
 * HappinessScore — Tracks user happiness via weighted events with 14-day sliding window.
 * Used to decide when to request app store reviews and detect unhappy users.
 */
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'shh-happiness' });

const EVENTS_KEY = 'happiness_events';
const MAX_EVENTS = 200;
const WINDOW_DAYS = 14;
const MS_PER_DAY = 86_400_000;

/* ─── Event types ─── */
type PositiveEvent =
  | 'shh_sent'
  | 'message_sent'
  | 'audio_sent'
  | 'photo_unblurred'
  | 'reveal_completed'
  | 'share_completed'
  | 'app_opened_streak_3d'
  | 'reaction_sent';

type NegativeEvent =
  | 'block_user'
  | 'report_content'
  | 'error_displayed'
  | 'shh_expired_unopened'
  | 'crash_detected'
  | 'push_disabled';

export type HappinessEventType = PositiveEvent | NegativeEvent;

interface HappinessEvent {
  type: HappinessEventType;
  timestamp: number;
}

/* ─── Weights ─── */
const HAPPINESS_WEIGHTS: Record<HappinessEventType, number> = {
  // positive
  shh_sent: 10,
  message_sent: 3,
  audio_sent: 8,
  photo_unblurred: 5,
  reveal_completed: 20,
  share_completed: 15,
  app_opened_streak_3d: 10,
  reaction_sent: 2,
  // negative
  block_user: -30,
  report_content: -25,
  error_displayed: -10,
  shh_expired_unopened: -15,
  crash_detected: -20,
  push_disabled: -10,
} as const;

/* ─── Helpers ─── */
function readEvents(): HappinessEvent[] {
  const raw = storage.getString(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HappinessEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: HappinessEvent[]): void {
  storage.set(EVENTS_KEY, JSON.stringify(events));
}

/**
 * Decay factor: events lose weight linearly over 14 days.
 * Day 0 = 1.0, Day 14 = 0.0
 */
function decayFactor(eventTimestamp: number, now: number): number {
  const ageDays = (now - eventTimestamp) / MS_PER_DAY;
  if (ageDays > WINDOW_DAYS) return 0;
  return 1 - ageDays / WINDOW_DAYS;
}

/* ─── Public API ─── */

/**
 * Track a happiness event. Appends to MMKV, trims to MAX_EVENTS.
 */
export function track(eventType: HappinessEventType): void {
  const events = readEvents();
  events.push({ type: eventType, timestamp: Date.now() });

  // Keep only the most recent MAX_EVENTS
  const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
  writeEvents(trimmed);
}

/**
 * Calculate current happiness score using 14-day sliding window with linear decay.
 * Score is clamped to [0, 100].
 */
export function calculate(): number {
  const now = Date.now();
  const events = readEvents();

  let score = 50; // neutral starting point

  for (const event of events) {
    const decay = decayFactor(event.timestamp, now);
    if (decay <= 0) continue;

    const weight = HAPPINESS_WEIGHTS[event.type] ?? 0;
    score += weight * decay;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Returns true if the user is considered happy (score >= 50).
 */
export function isHappy(): boolean {
  return calculate() >= 50;
}

/**
 * Check if a negative event occurred within the last hour.
 */
export function hasRecentNegativeEvent(): boolean {
  const oneHourAgo = Date.now() - 3_600_000;
  const events = readEvents();

  return events.some(
    (e) => e.timestamp > oneHourAgo && (HAPPINESS_WEIGHTS[e.type] ?? 0) < 0,
  );
}

/**
 * Get all events within the sliding window (for debugging).
 */
export function getWindowedEvents(): HappinessEvent[] {
  const cutoff = Date.now() - WINDOW_DAYS * MS_PER_DAY;
  return readEvents().filter((e) => e.timestamp > cutoff);
}
