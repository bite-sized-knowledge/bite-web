import { api } from './client';

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

export interface EventRequest {
  targetType: TargetType;
  targetId: string;
  eventType: EventType;
}

export const sendEvent = (
  targetType: TargetType,
  targetId: string,
  eventType: EventType,
) => {
  try {
    api.post('/v1/events', {
      targetType,
      targetId,
      eventType,
    });
  } catch {
    // silently ignore event tracking failures
  }
};
