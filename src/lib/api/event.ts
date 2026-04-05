import { getAccessToken } from './auth';

export const TARGET_TYPE = {
  BLOG: 'BLOG',
  ARTICLE: 'ARTICLE',
} as const;

export type TargetType = (typeof TARGET_TYPE)[keyof typeof TARGET_TYPE];

export const EVENT_TYPE = {
  F_IMP: 'F_IMP',
  R_IMP: 'R_IMP',
  ARTICLE_IN: 'ARTICLE_IN',
  ARTICLE_OUT: 'ARTICLE_OUT',
  ARTICLE_CLICK: 'ARTICLE_CLICK',
  LIKE: 'LIKE',
  LIKE_CANCEL: 'LIKE_CANCEL',
  SHARE: 'SHARE',
  ARCHIVE: 'ARCHIVE',
  ARCHIVE_CANCEL: 'ARCHIVE_CANCEL',
  UNINTEREST: 'UNINTEREST',
  BLOG_IN: 'BLOG_IN',
  BLOG_TO_ARTICLE: 'BLOG_TO_ARTICLE',
  B_IMP: 'B_IMP',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export interface EventExtras {
  /** Dwell time in milliseconds — typically set on ARTICLE_OUT. */
  dwellTimeMs?: number;
  /** Free-form source label (e.g. 'feed', 'bookmarks', 'blog', 'search'). */
  source?: string;
}

// Cross-tab coordination: once we see a 401 for events, stop trying for
// the rest of the session so scrolling doesn't keep printing errors. A
// fresh login (which rewrites the accessToken) resets the flag below.
let sessionDisabled = false;
let disabledForToken: string | null = null;

/**
 * Fire-and-forget analytics. Intentionally does NOT go through the
 * ApiClient — that layer auto-retries 401s and kicks a refresh flow,
 * which both pollute the console with extra errors for something we
 * can't do anything about. Events bypass all of that: plain fetch,
 * silent failure, and if we hit 401 once we disable tracking for the
 * current token so subsequent events don't keep failing.
 */
export const sendEvent = (
  targetType: TargetType,
  targetId: string,
  eventType: EventType,
  extras: EventExtras = {},
) => {
  if (typeof window === 'undefined') return;

  const token = getAccessToken();
  // No token at all — server will 401 and we can't do anything useful,
  // so skip entirely.
  if (!token) return;

  // We already saw a 401 for this token during this session — stop
  // bothering until the user logs in again (which issues a new token).
  if (sessionDisabled && disabledForToken === token) return;
  // If token was swapped (new login), re-enable.
  if (disabledForToken !== null && disabledForToken !== token) {
    sessionDisabled = false;
    disabledForToken = null;
  }

  const body: Record<string, unknown> = {
    // Legacy-compatible payload (bite-api accepts both camelCase legacy
    // and snake_case preferred shapes in the same request).
    targetType,
    targetId,
    eventType,
    event_type: eventType,
  };
  if (targetType === 'ARTICLE') body.article_id = targetId;
  if (extras.dwellTimeMs !== undefined) {
    body.dwell_time_ms = Math.max(0, Math.round(extras.dwellTimeMs));
  }
  if (extras.source) body.source = extras.source;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  // Raw fetch so we bypass the ApiClient's retry-on-401 + refresh flow.
  // Analytics should never trigger a token refresh dance.
  fetch(`${baseUrl}/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    credentials: 'include',
    keepalive: true, // survive page unload (e.g. ARTICLE_OUT on tab close)
  })
    .then((res) => {
      if (res.status === 401) {
        sessionDisabled = true;
        disabledForToken = token;
      }
    })
    .catch(() => {
      // network drop / offline — ignore
    });
};
