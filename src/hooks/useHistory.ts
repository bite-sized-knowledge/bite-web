'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getHistory } from '@/lib/api/article';

export function useHistory() {
  return useInfiniteQuery({
    queryKey: ['history'] as const,
    queryFn: getHistory,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.next ?? null,
  });
}
