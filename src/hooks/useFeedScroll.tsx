'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  ReactNode,
} from 'react';

/**
 * Cross-component feed scroll coordination.
 *
 * FeedContainer registers a scroll-to-top function on mount (keyed by tab).
 * BottomTabBar / Sidebar call `scrollToTop()` when the user re-taps the Feed
 * tab while already on `/feed`, and FeedHeader calls it when the user
 * re-taps the currently-active sub-tab (Latest / Recommend).
 */
type TabKey = 'latest' | 'recommend';

interface FeedScrollContextValue {
  registerScrollFn: (tab: TabKey, fn: (() => void) | null) => void;
  scrollToTop: (tab?: TabKey) => void;
  saveScrollPosition: (tab: TabKey, position: number) => void;
  getScrollPosition: (tab: TabKey) => number;
}

const FeedScrollContext = createContext<FeedScrollContextValue | null>(null);

export function FeedScrollProvider({ children }: { children: ReactNode }) {
  const scrollFnsRef = useRef<Record<TabKey, (() => void) | null>>({
    latest: null,
    recommend: null,
  });
  const positionsRef = useRef<Record<TabKey, number>>({
    latest: 0,
    recommend: 0,
  });

  const registerScrollFn = useCallback(
    (tab: TabKey, fn: (() => void) | null) => {
      scrollFnsRef.current[tab] = fn;
    },
    [],
  );

  const scrollToTop = useCallback((tab?: TabKey) => {
    if (tab) {
      scrollFnsRef.current[tab]?.();
      return;
    }
    // Fall back to whichever tab currently has a registered scroller
    // (only one FeedContainer mounts at a time).
    scrollFnsRef.current.latest?.();
    scrollFnsRef.current.recommend?.();
  }, []);

  const saveScrollPosition = useCallback((tab: TabKey, position: number) => {
    positionsRef.current[tab] = position;
  }, []);

  const getScrollPosition = useCallback((tab: TabKey) => {
    return positionsRef.current[tab];
  }, []);

  const value = useMemo<FeedScrollContextValue>(
    () => ({
      registerScrollFn,
      scrollToTop,
      saveScrollPosition,
      getScrollPosition,
    }),
    [registerScrollFn, scrollToTop, saveScrollPosition, getScrollPosition],
  );

  return (
    <FeedScrollContext.Provider value={value}>
      {children}
    </FeedScrollContext.Provider>
  );
}

export function useFeedScroll() {
  const ctx = useContext(FeedScrollContext);
  if (!ctx) {
    throw new Error('useFeedScroll must be used within <FeedScrollProvider>');
  }
  return ctx;
}
