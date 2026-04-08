'use client';

import { useCallback, useEffect, useState } from 'react';
import { createLocalStorage } from '@/lib/storage';

const MAX_ENTRIES = 10;
const storage = createLocalStorage<string[]>('recentSearches', []);

function readValidated(): string[] {
  const parsed = storage.read();
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is string => typeof v === 'string');
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(readValidated());
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const deduped = [trimmed, ...prev.filter((q) => q !== trimmed)];
      const next = deduped.slice(0, MAX_ENTRIES);
      storage.write(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setRecent((prev) => {
      const next = prev.filter((q) => q !== query);
      storage.write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    storage.clear();
    setRecent([]);
  }, []);

  return { recent, add, remove, clear };
}
