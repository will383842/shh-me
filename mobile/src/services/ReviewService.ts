/**
 * ReviewService — Smart app store review prompting.
 * Respects happiness score, install age, request frequency, and negative event buffer.
 */
import * as StoreReview from 'expo-store-review';
import { createMMKV } from 'react-native-mmkv';
import * as HappinessScore from './HappinessScore';

const storage = createMMKV({ id: 'shh-review' });

/* ─── Storage keys ─── */
const INSTALL_DATE_KEY = 'review_install_date';
const REQUEST_TIMESTAMPS_KEY = 'review_request_timestamps';

/* ─── Rules ─── */
const RULES = {
  MIN_DAYS_SINCE_INSTALL: 1,
  MIN_HAPPINESS_SCORE: 50,
  MAX_REQUESTS_PER_YEAR: 3,
  MIN_DAYS_BETWEEN_REQUESTS: 90,
  DELAY_AFTER_TRIGGER_MS: 3000,
} as const;

/* ─── Helpers ─── */

function getInstallDate(): number {
  const stored = storage.getNumber(INSTALL_DATE_KEY);
  if (stored) return stored;
  const now = Date.now();
  storage.set(INSTALL_DATE_KEY, now);
  return now;
}

function getRequestTimestamps(): number[] {
  const raw = storage.getString(REQUEST_TIMESTAMPS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function addRequestTimestamp(): void {
  const timestamps = getRequestTimestamps();
  timestamps.push(Date.now());
  storage.set(REQUEST_TIMESTAMPS_KEY, JSON.stringify(timestamps));
}

function daysSince(timestamp: number): number {
  return (Date.now() - timestamp) / 86_400_000;
}

/* ─── Trigger types ─── */
export type ReviewTrigger =
  | 'shh_sent'
  | 'reveal_completed'
  | 'share_completed'
  | 'audio_sent'
  | 'app_opened_streak_3d';

/* ─── Public API ─── */

/**
 * Attempts to request a store review if all conditions are met.
 * Returns true if the review was requested, false if any condition blocked it.
 */
export async function maybeRequestReview(trigger: ReviewTrigger): Promise<boolean> {
  // 1. Check if store review is available on this platform
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return false;

  // 2. Check happiness score
  const score = HappinessScore.calculate();
  if (score < RULES.MIN_HAPPINESS_SCORE) return false;

  // 3. Check install age
  const installDate = getInstallDate();
  if (daysSince(installDate) < RULES.MIN_DAYS_SINCE_INSTALL) return false;

  // 4. Check request frequency (max per year)
  const timestamps = getRequestTimestamps();
  const oneYearAgo = Date.now() - 365 * 86_400_000;
  const requestsThisYear = timestamps.filter((t) => t > oneYearAgo).length;
  if (requestsThisYear >= RULES.MAX_REQUESTS_PER_YEAR) return false;

  // 5. Check minimum days between requests
  const lastRequest = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 0;
  if (lastRequest > 0 && daysSince(lastRequest) < RULES.MIN_DAYS_BETWEEN_REQUESTS) return false;

  // 6. Check negative event buffer (no negative events in last hour)
  if (HappinessScore.hasRecentNegativeEvent()) return false;

  // 7. Delay before showing (feels more natural)
  await new Promise<void>((resolve) => {
    setTimeout(resolve, RULES.DELAY_AFTER_TRIGGER_MS);
  });

  // 8. Request the review
  try {
    await StoreReview.requestReview();
    addRequestTimestamp();
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure install date is recorded (call on app start).
 */
export function ensureInstallDateRecorded(): void {
  getInstallDate();
}
