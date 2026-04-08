'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getLikedArticles } from '@/lib/api/article';

export function useLikedArticles(enabled = true) {
  return useInfiniteQuery({
    queryKey: ['likes'] as const,
    queryFn: getLikedArticles,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.next ?? null,
    enabled,
  });
}
