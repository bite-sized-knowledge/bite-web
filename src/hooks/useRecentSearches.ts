'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'recentSearches';
const MAX_ENTRIES = 10;

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

function writeStorage(values: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // ignore
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  // Read from localStorage after mount to avoid SSR/hydration mismatch.
  // Lazy useState init would run on the server with an empty store and on
  // the client with the real store, which can desync server HTML from the
  // first client render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(readStorage());
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const deduped = [trimmed, ...prev.filter((q) => q !== trimmed)];
      const next = deduped.slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setRecent((prev) => {
      const next = prev.filter((q) => q !== query);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
    setRecent([]);
  }, []);

  return { recent, add, remove, clear };
}
