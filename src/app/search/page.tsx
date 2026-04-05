'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Article } from '@/types/Article';
import { searchArticles } from '@/lib/api/article';
import ArticleGrid from '@/components/grid/ArticleGrid';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';

const SearchLoadingLottie = dynamic(
  () => import('./SearchLoadingLottie').then((m) => m.SearchLoadingLottie),
  { ssr: false },
);

type Status = 'idle' | 'loading' | 'results' | 'empty' | 'error';

const DEBOUNCE_MS = 300;

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [articles, setArticles] = useState<Article[]>([]);
  const { recent, add: addRecent, remove: removeRecent, clear: clearRecent } =
    useRecentSearches();

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setStatus('idle');
        setArticles([]);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      try {
        const results = await searchArticles(q, controller.signal);
        if (controller.signal.aborted) return;
        setArticles(results);
        setStatus(results.length === 0 ? 'empty' : 'results');
        addRecent(q);
      } catch {
        if (controller.signal.aborted) return;
        setStatus('error');
      }
    },
    [addRecent],
  );

  // Debounced search as user types. When the query is empty we just skip
  // scheduling a search — the idle/results state is reset by handleChange
  // or handleClear so we never need setState inside this effect.
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // Cancel in-flight on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChipClick = (q: string) => {
    setQuery(q);
    runSearch(q);
  };

  const handleClear = () => {
    setQuery('');
    setStatus('idle');
    setArticles([]);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-[var(--header-height)] items-center gap-2 bg-[var(--color-bg)] px-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--color-gray4)] px-4 py-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              if (!next.trim()) {
                abortRef.current?.abort();
                setStatus('idle');
                setArticles([]);
              }
            }}
            placeholder="검색어를 입력해주세요"
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-gray3)]"
            enterKeyHint="search"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="검색어 지우기"
              className="flex h-5 w-5 items-center justify-center"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      {status === 'idle' && (
        <section className="px-4 py-4">
          {recent.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-gray3)]">
              최근 검색 기록이 없습니다
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  최근 검색어
                </h2>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-[var(--color-gray3)] hover:text-[var(--color-text)]"
                >
                  전체 삭제
                </button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <li key={q}>
                    <div className="flex items-center gap-1 rounded-full bg-[var(--color-gray4)] py-1 pl-3 pr-1 text-sm text-[var(--color-text)]">
                      <button
                        type="button"
                        onClick={() => handleChipClick(q)}
                        className="max-w-[160px] truncate"
                      >
                        {q}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecent(q)}
                        aria-label={`${q} 삭제`}
                        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[var(--color-gray3)]/30"
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center py-16">
          <SearchLoadingLottie />
        </div>
      )}

      {status === 'empty' && (
        <p className="py-16 text-center text-sm text-[var(--color-gray3)]">
          검색 결과가 없습니다
        </p>
      )}

      {status === 'error' && (
        <p className="py-16 text-center text-sm text-[var(--color-error)]">
          검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {status === 'results' && <ArticleGrid articles={articles} />}
    </main>
  );
}
