'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getBookmarkedArticles } from '@/lib/api/article';

export function useBookmarkedArticles() {
  return useInfiniteQuery({
    queryKey: ['bookmarks'] as const,
    queryFn: getBookmarkedArticles,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.next ?? null,
  });
}
