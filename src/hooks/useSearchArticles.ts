'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { searchArticles, type SearchFilters } from '@/lib/api/article';

type Args = {
  query: string;
  filters: SearchFilters;
  enabled?: boolean;
};

export function useSearchArticles({ query, filters, enabled = true }: Args) {
  const trimmed = query.trim();
  return useInfiniteQuery({
    queryKey: ['search', trimmed, filters] as const,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      return searchArticles(trimmed, signal, pageParam, filters);
    },
    getNextPageParam: (lastPage) => lastPage?.next ?? undefined,
    enabled: enabled && !!trimmed,
    staleTime: 30 * 1000,
  });
}
