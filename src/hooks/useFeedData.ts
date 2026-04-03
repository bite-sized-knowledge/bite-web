'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecommendedFeed, getRecentFeed } from '@/lib/api/feed';
import { Article } from '@/types/Article';

type TabType = 'latest' | 'recommend';

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

export function useFeedData(selectedTab: TabType) {
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [from, setFrom] = useState<string | null>(null);

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

  // Recent feed
  const {
    data: recentFeedData,
    isLoading: isRecentLoading,
    isFetching: isRecentFetching,
    isError: isRecentError,
    error: recentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['recentFeed', from],
    queryFn: () => getRecentFeed(from),
    enabled: false,
  });

  // Update recommended articles when data arrives
  useEffect(() => {
    if (recommendedFeed?.data) {
      setRecommendedArticles((prev) => {
        setIsFetchingMore(false);
        return mergeWithoutDuplicates(prev, recommendedFeed.data ?? []);
      });
    }
  }, [recommendedFeed, isRecommendedFetching]);

  // Update recent articles when data arrives
  useEffect(() => {
    if (recentFeedData) {
      setRecentArticles((prev) => {
        setIsFetchingMore(false);
        return mergeWithoutDuplicates(prev, recentFeedData.articles ?? []);
      });
    }
  }, [recentFeedData, isRecentFetching]);

  // Initial data load
  useEffect(() => {
    refetchRecent();
    refetchRecommended();
  }, [refetchRecent, refetchRecommended]);

  // Refetch recent when `from` changes
  useEffect(() => {
    if (from !== null) {
      refetchRecent();
    }
  }, [from, refetchRecent]);

  const getNextData = useCallback(() => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);

    if (selectedTab === 'latest') {
      if (recentFeedData?.next) {
        setFrom(recentFeedData.next);
      } else {
        setIsFetchingMore(false);
      }
    } else {
      refetchRecommended();
    }
  }, [selectedTab, recentFeedData, isFetchingMore, refetchRecommended]);

  const articles =
    selectedTab === 'latest' ? recentArticles : recommendedArticles;

  const isLoading =
    selectedTab === 'latest' ? isRecentLoading : isRecommendedLoading;

  const isError = isRecommendedError || isRecentError;
  const error = recommendedError || recentError;

  return {
    articles,
    isLoading,
    isFetchingMore,
    isError,
    error,
    getNextData,
    refetch: selectedTab === 'latest' ? refetchRecent : refetchRecommended,
  };
}
