import { getAccessToken } from './auth';
import { getApiBaseUrl } from './baseUrl';
import { getDeviceId, getSessionId } from '@/lib/device';

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
  S_IMP: 'S_IMP',
  S_PREVIEW: 'S_PREVIEW',
  S_PREVIEW_DISMISS: 'S_PREVIEW_DISMISS',
  S_CLICK: 'S_CLICK',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export interface EventExtras {
  /** Dwell time in milliseconds — typically set on ARTICLE_OUT. */
  dwellTimeMs?: number;
  /** Free-form source label (e.g. 'feed', 'bookmarks', 'blog', 'search'). */
  source?: string;
  /** Position in list (0-indexed) — for position bias correction. */
  position?: number;
  /** Arbitrary JSON metadata (e.g. search query). */
  metadata?: Record<string, unknown>;
  /** 검색 세션 단위 식별자. recsys-serving이 발급한 query_id를 echo. */
  queryId?: string;
  /** 검색어 원문(서버에서 200자 truncate). 검색 이벤트에만 첨부. */
  queryText?: string;
}

// Cross-tab coordination: once we see a 401 for authenticated events,
// stop trying auth-required events for the rest of the session.
let sessionDisabled = false;
let disabledForToken: string | null = null;

/**
 * Fire-and-forget analytics. Works for both authenticated and anonymous
 * users. Anonymous events include device_id for later merge on signup.
 */
export const sendEvent = (
  targetType: TargetType,
  targetId: string,
  eventType: EventType,
  extras: EventExtras = {},
) => {
  if (typeof window === 'undefined') return;

  const token = getAccessToken();
  const deviceId = getDeviceId();

  // Need at least one identifier
  if (!token && !deviceId) return;

  // If we saw a 401 for this token, skip auth-required events
  if (token && sessionDisabled && disabledForToken === token) return;
  if (token && disabledForToken !== null && disabledForToken !== token) {
    sessionDisabled = false;
    disabledForToken = null;
  }

  const sessionId = getSessionId();
  const body: Record<string, unknown> = {
    targetType,
    targetId,
    eventType,
    event_type: eventType,
    device_id: deviceId,
    session_id: sessionId,
  };
  if (targetType === 'ARTICLE') body.article_id = targetId;
  if (extras.dwellTimeMs !== undefined) {
    body.dwell_time_ms = Math.max(0, Math.round(extras.dwellTimeMs));
  }
  if (extras.source) body.source = extras.source;
  if (extras.position !== undefined) body.position = extras.position;
  if (extras.metadata) body.metadata = extras.metadata;
  if (extras.queryId) body.query_id = extras.queryId;
  if (extras.queryText) body.query_text = extras.queryText;

  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  fetch(`${baseUrl}/v1/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
    keepalive: true,
  })
    .then((res) => {
      if (token && res.status === 401) {
        sessionDisabled = true;
        disabledForToken = token;
      }
    })
    .catch(() => {
      // network drop / offline — ignore
    });
};
