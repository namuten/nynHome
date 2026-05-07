import api from './api';

const SESSION_KEY = 'crochub:session_id';
const OPT_OUT_KEY = 'crochub:analytics-opt-out';

/**
 * Gets or initializes a random unique Session ID stored in sessionStorage (cleared on tab close).
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Checks if the user opted out of tracking.
 */
export function isOptedOut(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(OPT_OUT_KEY) === 'true';
}

/**
 * Sets user tracking opt-out preference.
 */
export function setOptOut(value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPT_OUT_KEY, value ? 'true' : 'false');
}

export interface AnalyticsEventPayload {
  eventName: string;
  route: string;
  referrer?: string;
  locale?: string;
  metadata?: Record<string, any>;
}

/**
 * Dispatches a public tracking event. Fails silently to prevent breaking any user actions.
 */
export async function trackEvent(payload: AnalyticsEventPayload): Promise<void> {
  if (isOptedOut()) return;

  try {
    const sessionId = getSessionId();
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;
    const locale = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : undefined;

    await api.post('/analytics/events', {
      ...payload,
      sessionId,
      referrer: payload.referrer || referrer,
      locale: payload.locale || locale,
    });
  } catch (err) {
    // Fail silently in production
    console.warn('[ANALYTICS] Event dispatch bypassed:', err);
  }
}
export default { getSessionId, isOptedOut, setOptOut, trackEvent };
