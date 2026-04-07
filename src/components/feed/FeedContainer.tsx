'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Article } from '@/types/Article';
import { FeedCard } from './FeedCard';
import { CardSkeleton } from './CardSkeleton';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';
import { useFeedScroll } from '@/hooks/useFeedScroll';
import { ResumeReadingButton } from './ResumeReadingButton';
import { ScrollToTopButton } from './ScrollToTopButton';

interface FeedContainerProps {
  articles: Article[];
  isLoading: boolean;
  isFetchingMore: boolean;
  getNextData: () => void;
  selectedTab: 'latest' | 'recommend';
  onUninterest: (articleId: string) => void;
  onRefresh: () => void;
}

type TabKey = 'latest' | 'recommend';

// ============================================================================
// YouTube Shorts-style feed — take 3
// ============================================================================
//
// Previous attempts failed for two different reasons:
//
//   (1) Transform-based carousel with a gesture lock: trackpad inertia
//       fires wheel events for 1–3 seconds after a user swipe, which kept
//       resetting the "gesture end" debounce timer and swallowed the
//       user's next deliberate swipe. Result: "잘되다가 안 먹힐 때".
//
//   (2) Pure native scroll-snap: CSS scroll-snap needs >50% of viewport
//       displacement to cross to the next snap point. A small wheel tick
//       (120px) snaps back to the current card. Result: tiny swipes do
//       nothing, defeating the "any swipe = one advance" goal.
//
// This third approach is what YouTube Shorts actually does on desktop:
//
//   - Use a real scrollable container (native smoothness, a11y, keyboard
//     "Page Down" etc. all just work).
//   - Intercept wheel events with a NON-passive listener so we can call
//     preventDefault() and fully control when the scroll happens.
//   - On the FIRST wheel event after idle, run a smooth `scrollTo` to
//     the next (or previous) page. During that animation, all further
//     wheel events are swallowed.
//   - Inertia tail events after the animation ends are filtered out by
//     magnitude (they're always < ~25px deltaY on macOS trackpad).
//   - Touch is handled the same way via touchstart/touchend direction.
//   - Rollback safety: if native scroll somehow drifts us more than one
//     card from the anchor (e.g. a page jump), smooth-scroll back.
//
// ============================================================================

// Hand-rolled rAF animation — browser `scrollTo({behavior:'smooth'})` is
// distance-proportional and uncontrollable. 380ms fixed with a symmetric
// ease-in-out curve gives a *breathing* motion: gentle acceleration at
// the start (no jerk), constant speed through the middle, gentle
// deceleration at the end. This is the same shape Material Design's
// "standard" motion (cubic-bezier(0.4, 0, 0.2, 1)) uses, which feels
// organic rather than mechanical.
const ANIMATION_MS = 380;
// Post-animation inertia-tail filter. Short enough that the user can
// immediately kick off another deliberate gesture, long enough to cover
// the meaningful part of trackpad momentum decay.
const POST_ANIMATION_FILTER_MS = 550;
// Surge threshold: inertia decays monotonically, so an event well above
// this (and larger than the previous one) is a new user gesture.
const INERTIA_TAIL_DELTA = 45;
// Absolute minimum deltaY to count as ANY user intent — filters out the
// long low-amplitude tail of macOS momentum (deltas of 1–5px for 1-2s).
const MIN_TRIGGER_DELTA = 15;
const TOUCH_SWIPE_PX = 40;
const TOUCH_QUICK_MS = 300;
const TOUCH_QUICK_PX = 15;
const PREFETCH_GAP = 3;
const RESUME_STORAGE_KEY = (tab: TabKey) => `feed-resume-${tab}`;

interface ResumeState {
  articleId?: string;
  index?: number;
  ts?: number;
  topArticleId?: string;
}

function readResume(tab: TabKey): ResumeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(RESUME_STORAGE_KEY(tab));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as ResumeState;
  } catch {
    return null;
  }
}

function writeResume(tab: TabKey, state: ResumeState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      RESUME_STORAGE_KEY(tab),
      JSON.stringify({ ...state, ts: Date.now() }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export const FeedContainer: React.FC<FeedContainerProps> = ({
  articles,
  isLoading,
  isFetchingMore,
  getNextData,
  selectedTab,
  onUninterest,
  onRefresh,
}) => {
  const [indexByTab, setIndexByTab] = useState<Record<TabKey, number>>({
    latest: 0,
    recommend: 0,
  });
  const currentIndex = indexByTab[selectedTab];

  const scrollElRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef<Record<TabKey, boolean>>({
    latest: false,
    recommend: false,
  });
  // How many times we've asked for another page during restore. Caps
  // the cascade so a shorter-than-saved feed doesn't loop forever.
  const restoreFetchAttemptsRef = useRef(0);

  // --- Resume reading state ---
  const [resumeTarget, setResumeTarget] = useState<ResumeState | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [showResumeButton, setShowResumeButton] = useState(false);
  const resumeFetchAttemptsRef = useRef(0);

  // --- Scroll-to-top + refresh state ---
  const [isRefreshing, setIsRefreshing] = useState(false);

  // "Anchor" = the card we consider the user to be on right now. Used to
  // compute next/prev targets and to detect & roll back over-scrolls.
  const anchorIdxRef = useRef(0);

  // Timestamp until which we should ignore further wheel events because
  // a programmatic scroll animation is running.
  const animatingUntilRef = useRef(0);

  // Handle of the currently running rAF scroll animation, so we can
  // cancel it if the user fires a new gesture mid-flight.
  const rafIdRef = useRef<number | null>(null);

  // Last non-trivial wheel deltaY magnitude we've seen. Trackpad inertia
  // is a monotonically decaying sequence; a user re-flick is a sudden
  // *surge* (new peak). Comparing each new event to the running max lets
  // us distinguish "tail" from "new gesture" without a hard time lock.
  const lastWheelMagRef = useRef(0);
  const lastWheelTsRef = useRef(0);

  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef(0);

  const lastImpressionRef = useRef<string | null>(null);

  const { registerScrollFn } = useFeedScroll();

  const totalItems = articles.length;
  const maxIndex = Math.max(0, totalItems - 1);

  // --------------------------------------------------------------------------
  // Programmatic scroll helper — custom rAF animation
  //
  // We don't use the browser's native `scrollTo({behavior:'smooth'})`
  // because its duration is distance-proportional and uncancellable from
  // JS in a portable way; typical single-card hops take 500-600ms which
  // feels noticeably sluggish compared to YouTube Shorts / TikTok. A
  // hand-rolled rAF loop with a fixed 260ms ease-out-cubic gives us a
  // snappier, more controllable animation.
  // --------------------------------------------------------------------------
  interface ScrollOptions {
    durationMs?: number;
    ease?: (t: number) => number;
  }

  const scrollToIndex = (
    rawIdx: number,
    behavior: ScrollBehavior = 'smooth',
    opts?: ScrollOptions,
  ) => {
    const el = scrollElRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(rawIdx, maxIndex));
    const page = el.clientHeight;
    if (page <= 0) return;
    const target = clamped * page;

    // Cancel any in-flight animation — new intent replaces old.
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Already there, or caller asked for instant: just jump.
    if (behavior === 'auto' || Math.abs(el.scrollTop - target) < 2) {
      el.scrollTop = target;
      anchorIdxRef.current = clamped;
      setIndexByTab((p) =>
        p[selectedTab] === clamped ? p : { ...p, [selectedTab]: clamped },
      );
      animatingUntilRef.current = Date.now() + 50;
      return;
    }

    const start = el.scrollTop;
    const distance = target - start;
    const startTime = performance.now();
    const duration = opts?.durationMs ?? ANIMATION_MS;

    // Commit the logical anchor synchronously so subsequent keypresses
    // compute from the new target, not wherever the pixel happens to be.
    anchorIdxRef.current = clamped;
    setIndexByTab((p) =>
      p[selectedTab] === clamped ? p : { ...p, [selectedTab]: clamped },
    );
    animatingUntilRef.current = Date.now() + duration;

    // Default: easeInOutCubic — smooth on BOTH ends for single-card hops.
    // Callers can override with a custom ease for different feel.
    const defaultEase = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const ease = opts?.ease ?? defaultEase;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      el.scrollTop = start + distance * ease(t);
      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
  };

  // --------------------------------------------------------------------------
  // Native wheel listener (non-passive) — takes over scrolling entirely
  // --------------------------------------------------------------------------
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Block the browser's native scroll — we commit via scrollTo.
      e.preventDefault();

      const now = Date.now();
      const absDy = Math.abs(e.deltaY);

      // Always update tracking so the surge detector has recent data,
      // even when we end up discarding this event.
      const prevMag = lastWheelMagRef.current;
      const prevTs = lastWheelTsRef.current;
      lastWheelMagRef.current = absDy;
      lastWheelTsRef.current = now;

      // Inside the animation window: drop everything.
      if (now < animatingUntilRef.current) return;

      // Absolute floor — tiny events (1-5px) are always inertia noise,
      // never a deliberate user action. This cuts off the long tail that
      // would otherwise leak out once the post-animation window expires.
      if (absDy < MIN_TRIGGER_DELTA) return;

      const gapSincePrev = now - prevTs;
      const inInertiaTail =
        now < animatingUntilRef.current + POST_ANIMATION_FILTER_MS;

      if (inInertiaTail) {
        // We're in the inertia tail window following a fire. Only let a
        // NEW user gesture through — detect that via either:
        //   (a) a velocity *surge* (this event is noticeably bigger than
        //       the previous one — inertia always decays, never jumps),
        //   (b) a long pause followed by a fresh kick.
        const isSurge =
          absDy >= INERTIA_TAIL_DELTA &&
          absDy > prevMag * 1.5 &&
          gapSincePrev > 40;
        const isFreshKickAfterPause =
          gapSincePrev > 180 && absDy >= INERTIA_TAIL_DELTA;
        if (!isSurge && !isFreshKickAfterPause) return;
      }

      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      scrollToIndex(anchorIdxRef.current + dir, 'smooth');
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIndex, selectedTab]);

  // --------------------------------------------------------------------------
  // Touch handlers — one swipe == one advance, direction from delta sign
  // --------------------------------------------------------------------------
  // Register touch handlers via useEffect with { passive: false }
  // so preventDefault() works in onTouchMove.
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current != null) e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartYRef.current == null) return;
      const endY = e.changedTouches[0].clientY;
      const dy = endY - touchStartYRef.current;
      const dt = Date.now() - touchStartTimeRef.current;
      touchStartYRef.current = null;

      const isQuick = dt < TOUCH_QUICK_MS && Math.abs(dy) > TOUCH_QUICK_PX;
      if (dy < -TOUCH_SWIPE_PX || (isQuick && dy < 0)) {
        scrollToIndex(anchorIdxRef.current + 1, 'smooth');
      } else if (dy > TOUCH_SWIPE_PX || (isQuick && dy > 0)) {
        scrollToIndex(anchorIdxRef.current - 1, 'smooth');
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollToIndex]);

  // --------------------------------------------------------------------------
  // Keyboard shortcuts
  // --------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case 'j':
          e.preventDefault();
          scrollToIndex(anchorIdxRef.current + 1, 'smooth');
          break;
        case 'ArrowUp':
        case 'PageUp':
        case 'k':
          e.preventDefault();
          scrollToIndex(anchorIdxRef.current - 1, 'smooth');
          break;
        case ' ':
          e.preventDefault();
          scrollToIndex(anchorIdxRef.current + (e.shiftKey ? -1 : 1), 'smooth');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIndex, selectedTab]);

  // --------------------------------------------------------------------------
  // Scroll-to-top hook for tab bar double-tap / sidebar re-click
  // --------------------------------------------------------------------------
  useEffect(() => {
    const fn = () => scrollToIndex(0, 'smooth');
    registerScrollFn(selectedTab, fn);
    return () => registerScrollFn(selectedTab, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, registerScrollFn]);

  // --------------------------------------------------------------------------
  // Restore saved position on first articles-load for a tab.
  //
  // For 'latest': if new articles exist (top article changed), start at
  // index 0 and show a "resume reading" button. If no new articles,
  // restore to the saved position as before.
  //
  // For 'recommend': always restore to saved position (existing logic).
  //
  // The saved index may live on a page we haven't fetched yet (e.g. the
  // user was on card 25 but first-page returns 10). In that case we
  // progressively trigger `getNextData()` across renders until enough
  // pages are loaded, THEN jump to the target. A simple attempt counter
  // prevents infinite loops if the feed is shorter than the saved index.
  // --------------------------------------------------------------------------
  useLayoutEffect(() => {
    if (totalItems === 0) return;
    if (restoredRef.current[selectedTab]) return;

    const saved = readResume(selectedTab);
    if (!saved || (saved.index == null && !saved.articleId)) {
      restoredRef.current[selectedTab] = true;
      return;
    }

    // --- Latest tab: show new articles first, offer resume button ---
    if (selectedTab === 'latest') {
      // If the feed top hasn't changed, no new articles → normal restore
      const feedUnchanged =
        saved.topArticleId && articles[0]?.id === saved.topArticleId;

      if (feedUnchanged) {
        // No new articles — restore to saved position
        if (saved.articleId) {
          const idx = articles.findIndex((a) => a.id === saved.articleId);
          if (idx >= 0) {
            restoredRef.current[selectedTab] = true;
            requestAnimationFrame(() => scrollToIndex(idx, 'auto'));
            return;
          }
        }
        const savedIdx = typeof saved.index === 'number' ? saved.index : 0;
        if (savedIdx <= 0) {
          restoredRef.current[selectedTab] = true;
          return;
        }
        if (savedIdx < totalItems) {
          restoredRef.current[selectedTab] = true;
          requestAnimationFrame(() => scrollToIndex(savedIdx, 'auto'));
          return;
        }
        // Need more data — progressive fetch
        if (isFetchingMore) return;
        restoreFetchAttemptsRef.current += 1;
        if (restoreFetchAttemptsRef.current > 10) {
          restoredRef.current[selectedTab] = true;
          requestAnimationFrame(() =>
            scrollToIndex(Math.max(0, totalItems - 1), 'auto'),
          );
          return;
        }
        getNextData();
        return;
      }

      // New articles exist (or first visit with topArticleId not saved)
      // Check if saved position IS already index 0 → no button needed
      if (saved.articleId && articles[0]?.id === saved.articleId) {
        restoredRef.current[selectedTab] = true;
        return;
      }
      if (!saved.articleId && (saved.index === 0 || saved.index == null)) {
        restoredRef.current[selectedTab] = true;
        return;
      }

      // Stay at index 0, show resume button
      restoredRef.current[selectedTab] = true;
      setResumeTarget(saved);
      setShowResumeButton(true);
      return;
    }

    // --- Recommend tab: always restore to saved position (unchanged) ---
    if (saved.articleId) {
      const idx = articles.findIndex((a) => a.id === saved.articleId);
      if (idx >= 0) {
        restoredRef.current[selectedTab] = true;
        requestAnimationFrame(() => scrollToIndex(idx, 'auto'));
        return;
      }
    }

    const savedIdx = typeof saved.index === 'number' ? saved.index : 0;
    if (savedIdx <= 0) {
      restoredRef.current[selectedTab] = true;
      return;
    }
    if (savedIdx < totalItems) {
      restoredRef.current[selectedTab] = true;
      requestAnimationFrame(() => scrollToIndex(savedIdx, 'auto'));
      return;
    }

    if (isFetchingMore) return;
    restoreFetchAttemptsRef.current += 1;
    if (restoreFetchAttemptsRef.current > 10) {
      restoredRef.current[selectedTab] = true;
      requestAnimationFrame(() =>
        scrollToIndex(Math.max(0, totalItems - 1), 'auto'),
      );
      return;
    }
    getNextData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, selectedTab, totalItems, isFetchingMore]);

  // --------------------------------------------------------------------------
  // Resume reading: progressive fetch when user clicks the button
  // --------------------------------------------------------------------------
  useLayoutEffect(() => {
    if (!isResuming || !resumeTarget) return;
    if (totalItems === 0) return;

    if (resumeTarget.articleId) {
      const idx = articles.findIndex((a) => a.id === resumeTarget.articleId);
      if (idx >= 0) {
        setIsResuming(false);
        setResumeTarget(null);
        setShowResumeButton(false);
        resumeFetchAttemptsRef.current = 0;
        requestAnimationFrame(() => scrollToIndex(idx, 'smooth'));
        return;
      }
    }

    const savedIdx = typeof resumeTarget.index === 'number' ? resumeTarget.index : 0;
    if (savedIdx < totalItems) {
      setIsResuming(false);
      setResumeTarget(null);
      setShowResumeButton(false);
      resumeFetchAttemptsRef.current = 0;
      requestAnimationFrame(() => scrollToIndex(savedIdx, 'smooth'));
      return;
    }

    // Need more data
    if (isFetchingMore) return;
    resumeFetchAttemptsRef.current += 1;
    if (resumeFetchAttemptsRef.current > 10) {
      setIsResuming(false);
      setResumeTarget(null);
      setShowResumeButton(false);
      resumeFetchAttemptsRef.current = 0;
      return;
    }
    getNextData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResuming, resumeTarget, articles, totalItems, isFetchingMore]);

  // --------------------------------------------------------------------------
  // Dismiss resume button on scroll engagement or tab switch
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (selectedTab !== 'latest' || !showResumeButton) return;
    if (currentIndex >= 3) {
      setShowResumeButton(false);
      setResumeTarget(null);
    }
  }, [currentIndex, selectedTab, showResumeButton]);

  useEffect(() => {
    if (selectedTab !== 'latest') {
      setShowResumeButton(false);
      setResumeTarget(null);
      setIsResuming(false);
    }
  }, [selectedTab]);

  // --------------------------------------------------------------------------
  // Clear refreshing state when new data arrives after a refresh
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isRefreshing && totalItems > 0 && !isLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, totalItems, isLoading]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleResumeClick = useCallback(() => {
    if (!resumeTarget) return;
    setIsResuming(true);
  }, [resumeTarget]);

  const handleResumeDismiss = useCallback(() => {
    setShowResumeButton(false);
    setResumeTarget(null);
  }, []);

  const handleScrollToTop = useCallback(() => {
    const el = scrollElRef.current;
    if (!el) return;
    const cards = anchorIdxRef.current;
    if (cards <= 0) return;

    setIsRefreshing(true);

    // Cancel any in-flight animation.
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const startPos = el.scrollTop;

    // Each card gets ~130ms of visibility so you actually see them
    // rushing past — like a human flick. Capped to stay snappy.
    const totalDuration = Math.min(1200, 300 + cards * 130);

    // easeInOutQuart: gentle lift-off → fast rush through middle →
    // soft landing. Aggressive enough to feel exciting, gentle enough
    // that every card is briefly visible as it flies by.
    const ease = (t: number) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    // Commit logical state synchronously.
    anchorIdxRef.current = 0;
    setIndexByTab((p) =>
      p[selectedTab] === 0 ? p : { ...p, [selectedTab]: 0 },
    );
    animatingUntilRef.current = Date.now() + totalDuration;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / totalDuration);
      el.scrollTop = startPos * (1 - ease(t));
      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
        // Refresh AFTER animation finishes so cards don't vanish mid-scroll.
        onRefresh();
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefresh, selectedTab]);

  // Show scroll-to-top when deep in the feed and resume button is not active
  const showScrollTopButton =
    currentIndex >= 3 && !showResumeButton && !isResuming;

  // --------------------------------------------------------------------------
  // Persist + impression + pagination — off the settled currentIndex
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (totalItems === 0) return;
    // Don't persist until restore has finished — otherwise the first
    // render after reload writes `currentIndex=0` over the very saved
    // state we're about to read, and subsequent restores find nothing
    // to restore to.
    if (!restoredRef.current[selectedTab]) return;
    const article = articles[currentIndex];
    if (!article) return;
    writeResume(selectedTab, {
      articleId: article.id,
      index: currentIndex,
      topArticleId: articles[0]?.id,
    });
  }, [currentIndex, articles, totalItems, selectedTab]);

  useEffect(() => {
    if (totalItems === 0) return;
    const article = articles[currentIndex];
    if (!article) return;
    const key = `${selectedTab}:${article.id}`;
    if (lastImpressionRef.current === key) return;
    lastImpressionRef.current = key;
    sendEvent(
      TARGET_TYPE.ARTICLE,
      article.id,
      selectedTab === 'latest' ? EVENT_TYPE.R_IMP : EVENT_TYPE.F_IMP,
    );
  }, [currentIndex, articles, totalItems, selectedTab]);

  useEffect(() => {
    if (totalItems === 0 || isFetchingMore) return;
    if (currentIndex >= totalItems - PREFETCH_GAP) {
      getNextData();
    }
  }, [currentIndex, totalItems, isFetchingMore, getNextData]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  const showingSkeletons = (isLoading || isRefreshing) && totalItems === 0;

  return (
    <>
      <div
        className="feed-scroll-area"
        ref={scrollElRef}
      >
        {showingSkeletons
          ? [0, 1, 2].map((i) => (
              <div className="feed-snap-item" key={`sk-${i}`}>
                <div className="feed-card-sizer">
                  <CardSkeleton />
                </div>
              </div>
            ))
          : articles.map((article) => (
              <div className="feed-snap-item" key={article.id}>
                <div className="feed-card-sizer">
                  <FeedCard article={article} onUninterest={onUninterest} />
                </div>
              </div>
            ))}
        {isFetchingMore && (
          <div className="feed-snap-item" key="loading-more">
            <div className="feed-card-sizer">
              <CardSkeleton />
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showResumeButton && !isResuming && (
          <ResumeReadingButton
            key="resume"
            onClick={handleResumeClick}
            onDismiss={handleResumeDismiss}
          />
        )}
        {showScrollTopButton && (
          <ScrollToTopButton
            key="scroll-top"
            onClick={handleScrollToTop}
            isRefreshing={isRefreshing}
          />
        )}
      </AnimatePresence>
    </>
  );
};
