'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/provider';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';
import ArticleGrid from '@/components/grid/ArticleGrid';
import MemberModal from '@/components/auth/MemberModal';
import { Article } from '@/types/Article';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

export default function BookmarksPage() {
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeJwt(token) as { name?: string };
        setUserName(decoded.name ?? '');
      } catch {
        // ignore
      }
    }
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
      <MemberModal open={showModal} onClose={() => setShowModal(false)} />
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

      {articles.length === 0 && !isLoading ? (
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
            loading={isLoading || isFetchingNextPage}
            onLoadMore={handleLoadMore}
            hasMore={!!hasNextPage}
          />
        </>
      )}
    </main>
  );
}
