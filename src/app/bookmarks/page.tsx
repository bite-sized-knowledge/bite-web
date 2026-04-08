'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import { useTheme } from '@/lib/theme/provider';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';
import { getLocalBookmarkedArticles } from '@/lib/localBookmarks';
import ArticleGrid from '@/components/grid/ArticleGrid';
import { ArticlePreviewSheet } from '@/components/search/ArticlePreviewSheet';
import { Icon } from '@/components/ui/Icon';
import { Article } from '@/types/Article';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

const EMPTY_ARTICLES: Article[] = [];
const noop = () => () => {};

export default function BookmarksPage() {
  const { isLoggedIn } = useAuth();
  const { themeMode } = useTheme();

  const userName = useMemo(() => {
    if (!isLoggedIn) return '';
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeJwt(token) as { name?: string };
        return decoded.name ?? '';
      } catch {
        // ignore
      }
    }
    return '';
  }, [isLoggedIn]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useBookmarkedArticles(isLoggedIn);

  const serverArticles: Article[] = useMemo(
    () => data?.pages.flatMap((page) => page?.articles ?? []) ?? [],
    [data],
  );

  const getClientSnapshot = useCallback(
    () => (isLoggedIn ? EMPTY_ARTICLES : getLocalBookmarkedArticles()),
    [isLoggedIn],
  );
  const localArticles = useSyncExternalStore(
    noop,
    getClientSnapshot,
    () => EMPTY_ARTICLES,
  );

  const articles = isLoggedIn ? serverArticles : localArticles;

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleArticleClick = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const emptyImage =
    themeMode === 'dark'
      ? '/images/empty_bookmark_dark.png'
      : '/images/empty_bookmark_light.png';

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4">
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          북마크
        </h1>
      </header>

      {/* Guest nudge banner */}
      {!isLoggedIn && localArticles.length > 0 && (
        <div
          className="mx-4 mb-4 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: 'color-mix(in srgb, var(--color-main) 10%, var(--color-bg))' }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon name="cookie_fill" size={36} />
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-text)]">
                저장한 글, 안전하게 보관하세요
              </p>
              <p className="text-sm text-[var(--color-gray3)] mt-0.5">
                로그인하면 어디서든 다시 읽을 수 있어요
              </p>
            </div>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center justify-center h-11 px-8 rounded-xl bg-[var(--color-main)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            로그인하기
          </Link>
        </div>
      )}

      {isLoggedIn && isLoading ? (
        <>
          {/* Profile skeleton */}
          <div className="flex items-center gap-2 px-4 py-5 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gray4)] shrink-0" />
            <div className="h-5 w-24 rounded bg-[var(--color-gray4)]" />
          </div>
          <ArticleGrid articles={[]} loading={true} />
        </>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <Image
            src={emptyImage}
            alt=""
            width={180}
            height={180}
            aria-hidden
          />
          <p className="text-base text-[var(--color-gray3)]">
            저장한 글이 없습니다
          </p>
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="flex items-center justify-center h-11 px-8 rounded-xl bg-[var(--color-main)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              로그인하고 시작하기
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Profile section — logged-in only */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 px-4 py-5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-gray4)]">
                <Image
                  src="/images/profileImage.png"
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  aria-hidden
                />
              </div>
              <span className="text-lg font-bold text-[var(--color-text)]">
                {userName}
              </span>
            </div>
          )}

          <ArticleGrid
            articles={articles}
            loading={isLoggedIn ? isFetchingNextPage : false}
            onLoadMore={isLoggedIn ? handleLoadMore : undefined}
            hasMore={isLoggedIn ? !!hasNextPage : false}
            onArticleClick={handleArticleClick}
          />
        </>
      )}

      <ArticlePreviewSheet
        article={selectedArticle}
        query=""
        position={0}
        onClose={() => setSelectedArticle(null)}
      />
    </main>
  );
}
