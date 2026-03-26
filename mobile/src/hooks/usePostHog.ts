/**
 * usePostHog — Analytics tracking hook.
 * In dev/demo mode, logs to console. Ready for real PostHog SDK when configured.
 * Also feeds events into HappinessScore.
 */
import { useCallback } from 'react';
import * as HappinessScore from '../services/HappinessScore';
import type { HappinessEventType } from '../services/HappinessScore';

/** Known happiness events that also get tracked in the score */
const HAPPINESS_EVENTS = new Set<string>([
  'shh_sent',
  'message_sent',
  'audio_sent',
  'photo_unblurred',
  'reveal_completed',
  'share_completed',
  'app_opened_streak_3d',
  'reaction_sent',
  'block_user',
  'report_content',
  'error_displayed',
  'shh_expired_unopened',
  'crash_detected',
  'push_disabled',
]);

interface PostHogHook {
  capture: (event: string, properties?: Record<string, unknown>) => void;
}

export function usePostHog(): PostHogHook {
  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      // In dev mode, log to console
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[PostHog]', event, properties ?? '');
      }

      // Feed into HappinessScore if it's a known event
      if (HAPPINESS_EVENTS.has(event)) {
        HappinessScore.track(event as HappinessEventType);
      }

      // TODO: When PostHog is configured in production, call:
      // posthog.capture(event, properties);
    },
    [],
  );

  return { capture };
}
