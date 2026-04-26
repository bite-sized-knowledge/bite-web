'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Article } from '@/types/Article';
import { SearchFilters as ApiSearchFilters, searchArticles } from '@/lib/api/article';
import { SearchResultList } from '@/components/search/SearchResultList';
import { ArticlePreviewSheet } from '@/components/search/ArticlePreviewSheet';
import { SearchFilters, SearchLang } from '@/components/search/SearchFilters';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';

const SearchLoadingLottie = dynamic(
  () => import('./SearchLoadingLottie').then((m) => m.SearchLoadingLottie),
  { ssr: false },
);

type Status = 'idle' | 'loading' | 'results' | 'empty' | 'error';

const DEBOUNCE_MS = 300;

function buildQueryString(
  query: string,
  categoryId: number | null,
  lang: SearchLang,
): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (categoryId !== null) params.set('category', String(categoryId));
  if (lang) params.set('lang', lang);
  return params.toString();
}

function buildApiFilters(
  categoryId: number | null,
  lang: SearchLang,
): ApiSearchFilters {
  const filters: ApiSearchFilters = {};
  if (categoryId !== null) filters.categoryId = categoryId;
  if (lang) filters.lang = lang;
  return filters;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(() => {
    const v = searchParams.get('category');
    return v ? Number(v) : null;
  });
  const [lang, setLang] = useState<SearchLang>(() => {
    const v = searchParams.get('lang');
    return v === 'ko' || v === 'en' ? v : null;
  });

  const [status, setStatus] = useState<Status>('idle');
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPosition, setSelectedPosition] = useState(0);
  const { recent, add: addRecent, remove: removeRecent, clear: clearRecent } =
    useRecentSearches();

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef(query);
  const categoryRef = useRef(categoryId);
  const langRef = useRef<SearchLang>(lang);
  queryRef.current = query;
  categoryRef.current = categoryId;
  langRef.current = lang;

  useEffect(() => {
    const qs = buildQueryString(query, categoryId, lang);
    const url = qs ? `/search?${qs}` : '/search';
    router.replace(url, { scroll: false });
  }, [query, categoryId, lang, router]);

  const runSearch = useCallback(
    async (q: string, cat: number | null, lg: SearchLang) => {
      if (!q.trim()) {
        setStatus('idle');
        setArticles([]);
        setNextCursor(null);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      try {
        const { articles: results, next } = await searchArticles(
          q,
          controller.signal,
          undefined,
          buildApiFilters(cat, lg),
        );
        if (controller.signal.aborted) return;
        setArticles(results);
        setNextCursor(next);
        setStatus(results.length === 0 ? 'empty' : 'results');
        addRecent(q);
      } catch {
        if (controller.signal.aborted) return;
        setStatus('error');
      }
    },
    [addRecent],
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const controller = new AbortController();
      const { articles: more, next } = await searchArticles(
        queryRef.current,
        controller.signal,
        nextCursor,
        buildApiFilters(categoryRef.current, langRef.current),
      );
      setArticles((prev) => [...prev, ...more]);
      setNextCursor(next);
    } catch {
      // silently ignore — user can scroll again to retry
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => runSearch(query, categoryId, lang), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, categoryId, lang, runSearch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChipClick = (q: string) => {
    setQuery(q);
    runSearch(q, categoryId, lang);
  };

  const handleClear = () => {
    setQuery('');
    setStatus('idle');
    setArticles([]);
    setNextCursor(null);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
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
                setNextCursor(null);
              }
            }}
            placeholder="키워드 또는 자연스러운 문장으로 검색해보세요"
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

      <SearchFilters
        categoryId={categoryId}
        lang={lang}
        onCategoryChange={setCategoryId}
        onLangChange={setLang}
      />

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

      {status === 'results' && (
        <SearchResultList
          articles={articles}
          query={query}
          hasMore={nextCursor !== null}
          loading={loadingMore}
          onLoadMore={loadMore}
          onSelectArticle={(article, position) => {
            setSelectedArticle(article);
            setSelectedPosition(position);
          }}
        />
      )}

      <ArticlePreviewSheet
        article={selectedArticle}
        query={query}
        position={selectedPosition}
        onClose={() => setSelectedArticle(null)}
      />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[var(--color-bg)]" />}>
      <SearchPageContent />
    </Suspense>
  );
}
