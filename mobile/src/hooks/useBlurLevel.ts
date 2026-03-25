/**
 * Maps exchange_count to blur level.
 * Blur levels: [40, 30, 15, 5, 0]
 * 0 exchanges → 40 (max blur), 4+ → 0 (no blur / revealed)
 */
const BLUR_LEVELS = [40, 30, 15, 5, 0] as const;

export function useBlurLevel(exchangeCount: number): number {
  const index = Math.min(exchangeCount, BLUR_LEVELS.length - 1);
  return BLUR_LEVELS[index];
}

export { BLUR_LEVELS };
