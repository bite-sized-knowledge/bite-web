'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Article } from '@/types/Article';
import type { SearchFilters as ApiSearchFilters } from '@/lib/api/article';
import { SearchResultList } from '@/components/search/SearchResultList';
import { ArticlePreviewSheet } from '@/components/search/ArticlePreviewSheet';
import { SearchFilters, SearchLang } from '@/components/search/SearchFilters';
import { SearchSuggestions } from '@/components/search/SearchSuggestions';
import { useSearchArticles } from '@/hooks/useSearchArticles';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';

const SearchLoadingLottie = dynamic(
  () => import('./SearchLoadingLottie').then((m) => m.SearchLoadingLottie),
  { ssr: false },
);

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

  const [inputValue, setInputValue] = useState(() => searchParams.get('q') ?? '');
  const [committedQuery, setCommittedQuery] = useState(inputValue);
  const [categoryId, setCategoryId] = useState<number | null>(() => {
    const v = searchParams.get('category');
    return v ? Number(v) : null;
  });
  const [lang, setLang] = useState<SearchLang>(() => {
    const v = searchParams.get('lang');
    return v === 'ko' || v === 'en' ? v : null;
  });
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPosition, setSelectedPosition] = useState(0);

  const { recent, add: addRecent, remove: removeRecent, clear: clearRecent } =
    useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 입력 → committedQuery 디바운스
  useEffect(() => {
    const t = setTimeout(() => setCommittedQuery(inputValue.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputValue]);

  const filters = useMemo(() => buildApiFilters(categoryId, lang), [categoryId, lang]);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useSearchArticles({
    query: committedQuery,
    filters,
    enabled: committedQuery.length > 0,
  });

  const articles = useMemo(
    () => data?.pages.flatMap((p) => p.articles) ?? [],
    [data],
  );

  const queryId = data?.pages[0]?.queryId ?? null;
  const rankingFilters = useMemo(() => ({ categoryId, lang }), [categoryId, lang]);
  const ranking = useMemo(
    () => ({ queryId, mode: 'hybrid' as const, filters: rankingFilters }),
    [queryId, rankingFilters],
  );

  const status = useMemo<
    'idle' | 'loading' | 'results' | 'empty' | 'error'
  >(() => {
    if (!committedQuery) return 'idle';
    if (isError) return 'error';
    if (isFetching && articles.length === 0) return 'loading';
    if (!isFetching && articles.length === 0) return 'empty';
    return 'results';
  }, [committedQuery, isError, isFetching, articles.length]);

  // URL 동기화
  useEffect(() => {
    const qs = buildQueryString(committedQuery, categoryId, lang);
    const url = qs ? `/search?${qs}` : '/search';
    router.replace(url, { scroll: false });
  }, [committedQuery, categoryId, lang, router]);

  // 검색 결과 도달 시 최근 검색어 기록
  useEffect(() => {
    if (status === 'results' && committedQuery) {
      addRecent(committedQuery);
    }
  }, [status, committedQuery, addRecent]);

  // 자동완성: input 포커스 + 입력 중에 표시
  const suggestPrefix = inputValue.trim();
  const suggestionsEnabled = suggestionsOpen && suggestPrefix.length >= 0;
  const { data: suggestionsData } = useSuggestions(suggestPrefix, suggestionsEnabled);
  const suggestions = suggestionsData ?? [];

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commitQuery = useCallback((q: string) => {
    setInputValue(q);
    setCommittedQuery(q.trim());
    setSuggestionsOpen(false);
  }, []);

  const handleClear = () => {
    setInputValue('');
    setCommittedQuery('');
    setSuggestionsOpen(false);
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
        <div ref={containerRef} className="relative flex-1">
          <div className="flex items-center gap-2 rounded-full bg-[var(--color-gray4)] px-4 py-2">
            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitQuery(inputValue);
                } else if (e.key === 'Escape') {
                  setSuggestionsOpen(false);
                }
              }}
              placeholder="키워드 또는 자연스러운 문장으로 검색해보세요"
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-gray3)]"
              enterKeyHint="search"
              autoComplete="off"
            />
            {inputValue.length > 0 && (
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
          {suggestionsOpen && (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={commitQuery}
            />
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
                        onClick={() => commitQuery(q)}
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
          query={committedQuery}
          hasMore={!!hasNextPage}
          loading={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          onSelectArticle={(article, position) => {
            setSelectedArticle(article);
            setSelectedPosition(position);
          }}
          ranking={ranking}
        />
      )}

      <ArticlePreviewSheet
        article={selectedArticle}
        query={committedQuery}
        position={selectedPosition}
        ranking={ranking}
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
