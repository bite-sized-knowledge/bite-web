'use client';

import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
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

export function useFeedData(selectedTab: TabType, filter: FeedFilter = { type: 'all' }) {
  const [recommendedArticles, dispatchRecommended] = useReducer(articleReducer, []);
  const [recentArticles, dispatchRecent] = useReducer(articleReducer, []);
  const [fetchMoreRequested, setFetchMoreRequested] = useState(false);
  const [from, setFrom] = useState<string | null>(null);

  // Derive lang/blogId from filter for API calls
  const lang = filter.type === 'lang' ? filter.value : null;
  const blogId = filter.type === 'blog' ? filter.blogId : null;
  const filterKey = filter.type === 'all' ? 'all' : filter.type === 'lang' ? `lang:${filter.value}` : `blog:${filter.blogId}`;

  // Track filter version to force refetch after reset
  const [filterVersion, setFilterVersion] = useState(0);

  // Reset recent articles when filter changes
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      dispatchRecent({ type: 'reset' });
      setFrom(null);
      setFetchMoreRequested(false);
      // Increment version — this batches with setFrom(null), so both
      // commit in the same render. The query effect below sees
      // from=null + new filterKey + new version → correct refetch.
      setFilterVersion((v) => v + 1);
    }
  }, [filterKey]);

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

  // Suppress auto-fetch during the transitional render where filterKey
  // has changed but from/filterVersion haven't been reset yet.
  const isResetting = prevFilterKey.current !== filterKey;

  // Recent feed — queryKey includes filterVersion so react-query
  // sees a new key after filter reset and refetches automatically.
  const {
    data: recentFeedData,
    isLoading: isRecentLoading,
    isFetching: isRecentFetching,
    isError: isRecentError,
    error: recentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['recentFeed', from, filter, filterVersion],
    queryFn: () => getRecentFeed(from, lang, blogId),
    enabled: selectedTab === 'latest' && !isResetting,
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

  // Update recent articles when data arrives. Reset fetchMoreRequested
  // once the response lands so a subsequent getNextData() call is free
  // to fire — otherwise the flag stays stuck true and the next page
  // request short-circuits.
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
      // Backend returns `next: ""` (omitted from JSON) when there are
      // no more pages. Treat both undefined and empty string as "end of
      // feed" and skip the fetch entirely so we don't thrash the state.
      const next = recentFeedData?.next;
      if (!next) return;
      setFetchMoreRequested(true);
      setFrom(next);
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

  // Remove an article from both tabs so "not interested" and similar
  // actions stick regardless of which tab the user is looking at.
  const removeArticle = useCallback((articleId: string) => {
    dispatchRecent({ type: 'remove', articleId });
    dispatchRecommended({ type: 'remove', articleId });
  }, []);

  // Full refresh: clear articles + reset cursor + refetch from scratch.
  // Used by scroll-to-top button to reload the latest feed.
  const refresh = useCallback(() => {
    if (selectedTab === 'latest') {
      dispatchRecent({ type: 'reset' });
      setFrom(null);
      setFetchMoreRequested(false);
      setFilterVersion((v) => v + 1);
    } else {
      dispatchRecommended({ type: 'reset' });
      setFetchMoreRequested(false);
      setTimeout(() => refetchRecommended(), 0);
    }
  }, [selectedTab, refetchRecommended]);

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
