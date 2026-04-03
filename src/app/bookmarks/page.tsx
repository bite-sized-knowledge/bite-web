'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';
import ArticleGrid from '@/components/grid/ArticleGrid';
import MemberModal from '@/components/auth/MemberModal';
import { Article } from '@/types/Article';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

export default function BookmarksPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const showModal = !isLoggedIn;
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
  } = useBookmarkedArticles();

  const articles: Article[] = useMemo(
    () => data?.pages.flatMap((page) => page?.articles ?? []) ?? [],
    [data],
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => router.back()} />
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4">
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          북마크
        </h1>
      </header>

      {isLoading ? (
        <>
          {/* Profile skeleton */}
          <div className="flex items-center gap-2 px-4 py-5 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gray4)] shrink-0" />
            <div className="h-5 w-24 rounded bg-[var(--color-gray4)]" />
          </div>
          <ArticleGrid articles={[]} loading={true} />
        </>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-base text-[var(--color-gray3)]">
            저장한 글이 없습니다
          </p>
        </div>
      ) : (
        <>
          {/* Profile section */}
          <div className="flex items-center gap-2 px-4 py-5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gray4)] shrink-0" />
            <span className="text-lg font-bold text-[var(--color-text)]">
              {userName}
            </span>
          </div>

          <ArticleGrid
            articles={articles}
            loading={isFetchingNextPage}
            onLoadMore={handleLoadMore}
            hasMore={!!hasNextPage}
          />
        </>
      )}
    </main>
  );
}
