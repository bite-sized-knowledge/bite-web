'use client';

import { useCallback, useEffect, useRef } from 'react';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

/**
 * Fires ARTICLE_CLICK when the user opens an article in a new tab and
 * ARTICLE_OUT (with dwell_time_ms) when they return. Dwell is computed
 * client-side from the time the article was opened to the time the web
 * app regains visibility/focus. Only one article is "open" at a time —
 * if the user opens a second article before returning, the first one is
 * treated as closed with whatever dwell has accumulated so far.
 */
interface Pending {
  articleId: string;
  openedAt: number;
}

export function useArticleReaderEvents() {
  const pendingRef = useRef<Pending | null>(null);

  const flushOut = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    const dwellTimeMs = Date.now() - pending.openedAt;
    pendingRef.current = null;
    sendEvent(
      TARGET_TYPE.ARTICLE,
      pending.articleId,
      EVENT_TYPE.ARTICLE_OUT,
      { dwellTimeMs },
    );
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        flushOut();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', flushOut);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', flushOut);
    };
  }, [flushOut]);

  const openArticle = useCallback(
    (articleId: string, url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
      } catch {
        return;
      }
      // If another article is still "open" in a background tab, close it
      // first so we don't lose its dwell time.
      flushOut();
      sendEvent(TARGET_TYPE.ARTICLE, articleId, EVENT_TYPE.ARTICLE_CLICK);
      pendingRef.current = { articleId, openedAt: Date.now() };
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [flushOut],
  );

  return { openArticle };
}
