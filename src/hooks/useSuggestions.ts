'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { suggestQueries } from '@/lib/api/article';

const DEBOUNCE_MS = 150;

export function useSuggestions(prefix: string, enabled = true) {
  const [debouncedPrefix, setDebouncedPrefix] = useState(prefix);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrefix(prefix), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [prefix]);

  const trimmed = debouncedPrefix.trim();
  return useQuery({
    queryKey: ['search-suggest', trimmed] as const,
    queryFn: ({ signal }) => suggestQueries(trimmed, signal),
    enabled,
    staleTime: 30 * 1000,
  });
}
