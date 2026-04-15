'use client';

import { useState, useEffect, useCallback, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecommendedFeed, getRecentFeed } from '@/lib/api/feed';
import { Article } from '@/types/Article';

type TabType = 'latest' | 'recommend';

export type FeedFilter =
  | { type: 'all' }
  | { type: 'lang'; value: 'ko' | 'en' }
  | { type: 'blog'; blogId: string };

function mergeWithoutDuplicates(prev: Article[], next: Article[]): Article[] {
  const ids = new Set(prev.map((a) => a.id));
  const merged = [...prev];
  for (const article of next) {
    if (!ids.has(article.id)) {
      merged.push(article);
      ids.add(article.id);
    }
  }
  return merged;
}

type ArticleAction =
  | { type: 'merge'; articles: Article[] }
  | { type: 'reset' }
  | { type: 'remove'; articleId: string };

function articleReducer(state: Article[], action: ArticleAction): Article[] {
  switch (action.type) {
    case 'merge':
      return mergeWithoutDuplicates(state, action.articles);
    case 'reset':
      return [];
    case 'remove':
      return state.filter((a) => a.id !== action.articleId);
  }
}

function filterKey(filter: FeedFilter): string {
  if (filter.type === 'all') return 'all';
  if (filter.type === 'lang') return `lang:${filter.value}`;
  return `blog:${filter.blogId}`;
}

// Bundles cursor + filter into one reducer so filter changes atomically
// reset `from` without needing setState-in-effect.
interface CursorState {
  from: string | null;
  activeFilterKey: string;
}

type CursorAction =
  | { type: 'next'; from: string }
  | { type: 'reset' }
  | { type: 'filterChanged'; filterKey: string };

function cursorReducer(state: CursorState, action: CursorAction): CursorState {
  switch (action.type) {
    case 'next':
      return { ...state, from: action.from };
    case 'reset':
      return { ...state, from: null };
    case 'filterChanged':
      if (state.activeFilterKey === action.filterKey) return state;
      return { from: null, activeFilterKey: action.filterKey };
  }
}

export function useFeedData(selectedTab: TabType, filter: FeedFilter = { type: 'all' }) {
  const [recommendedArticles, dispatchRecommended] = useReducer(articleReducer, []);
  const [recentArticles, dispatchRecent] = useReducer(articleReducer, []);
  const [fetchMoreRequested, setFetchMoreRequested] = useState(false);

  const lang = filter.type === 'lang' ? filter.value : null;
  const blogId = filter.type === 'blog' ? filter.blogId : null;
  const fKey = filterKey(filter);

  // Cursor reducer: when filterKey changes, `from` resets to null in the
  // SAME render — no effect needed, no transitional render with stale from.
  const [cursor, dispatchCursor] = useReducer(cursorReducer, {
    from: null,
    activeFilterKey: fKey,
  });

  // Synchronous dispatch during render when filter changes — this is safe
  // because it only fires when the filter prop actually changes, producing
  // the same result for the same input (idempotent).
  if (cursor.activeFilterKey !== fKey) {
    dispatchCursor({ type: 'filterChanged', filterKey: fKey });
    dispatchRecent({ type: 'reset' });
  }

  // Recommended feed
  const {
    data: recommendedFeed,
    isLoading: isRecommendedLoading,
    isFetching: isRecommendedFetching,
    isError: isRecommendedError,
    error: recommendedError,
    refetch: refetchRecommended,
  } = useQuery({
    queryKey: ['recommendedFeed'],
    queryFn: getRecommendedFeed,
    enabled: false,
  });

  // Recent feed — auto-fetches when queryKey changes (cursor.from or filter).
  // `cursor.activeFilterKey` stays in sync with `fKey` after the dispatch
  // above, so `enabled` is true in the same render where from was reset.
  const {
    data: recentFeedData,
    isLoading: isRecentLoading,
    isFetching: isRecentFetching,
    isError: isRecentError,
    error: recentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['recentFeed', cursor.from, filter],
    queryFn: () => getRecentFeed(cursor.from, lang, blogId),
    enabled: selectedTab === 'latest' && cursor.activeFilterKey === fKey,
  });

  // Derive isFetchingMore from request state and fetching state
  const isFetchingMore = fetchMoreRequested && (isRecommendedFetching || isRecentFetching);

  // Update recommended articles when data arrives.
  useEffect(() => {
    if (recommendedFeed?.data && !isRecommendedFetching) {
      dispatchRecommended({ type: 'merge', articles: recommendedFeed.data ?? [] });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchMoreRequested(false);
    }
  }, [recommendedFeed, isRecommendedFetching]);

  // Update recent articles when data arrives.
  useEffect(() => {
    if (recentFeedData && !isRecentFetching) {
      dispatchRecent({ type: 'merge', articles: recentFeedData.articles ?? [] });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchMoreRequested(false);
    }
  }, [recentFeedData, isRecentFetching]);

  // Initial load for recommended feed
  useEffect(() => {
    refetchRecommended();
  }, [refetchRecommended]);

  // Refetch recommended when switching to recommend tab
  useEffect(() => {
    if (selectedTab === 'recommend') {
      dispatchRecommended({ type: 'reset' });
      refetchRecommended();
    }
  }, [selectedTab, refetchRecommended]);

  const getNextData = useCallback(() => {
    if (isFetchingMore) return;

    if (selectedTab === 'latest') {
      const next = recentFeedData?.next;
      if (!next) return;
      setFetchMoreRequested(true);
      dispatchCursor({ type: 'next', from: next });
    } else {
      setFetchMoreRequested(true);
      refetchRecommended();
    }
  }, [selectedTab, recentFeedData, isFetchingMore, refetchRecommended]);

  const articles =
    selectedTab === 'latest' ? recentArticles : recommendedArticles;

  const isLoading =
    selectedTab === 'latest' ? isRecentLoading : isRecommendedLoading;

  const isError = isRecommendedError || isRecentError;
  const error = recommendedError || recentError;

  const removeArticle = useCallback((articleId: string) => {
    dispatchRecent({ type: 'remove', articleId });
    dispatchRecommended({ type: 'remove', articleId });
  }, []);

  const refresh = useCallback(() => {
    if (selectedTab === 'latest') {
      dispatchRecent({ type: 'reset' });
      dispatchCursor({ type: 'reset' });
      setFetchMoreRequested(false);
      setTimeout(() => refetchRecent(), 0);
    } else {
      dispatchRecommended({ type: 'reset' });
      setFetchMoreRequested(false);
      setTimeout(() => refetchRecommended(), 0);
    }
  }, [selectedTab, refetchRecent, refetchRecommended]);

  return {
    articles,
    isLoading,
    isFetchingMore,
    isError,
    error,
    getNextData,
    refetch: selectedTab === 'latest' ? refetchRecent : refetchRecommended,
    removeArticle,
    refresh,
  };
}
