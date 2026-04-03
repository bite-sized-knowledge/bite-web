'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { useHistory } from '@/hooks/useHistory';
import ArticleGrid from '@/components/grid/ArticleGrid';
import MemberModal from '@/components/auth/MemberModal';
import { Article } from '@/types/Article';

export default function HistoryPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const showModal = !isLoggedIn;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useHistory();

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
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <button
          type="button"
          onClick={() => router.push('/my')}
          className="text-[var(--color-text)] text-xl cursor-pointer"
          aria-label="뒤로 가기"
        >
          &larr;
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          최근 본 글
        </h1>
      </header>

      {isLoading ? (
        <ArticleGrid articles={[]} loading={true} />
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-base text-[var(--color-gray3)]">
            최근 본 글이 없습니다
          </p>
        </div>
      ) : (
        <ArticleGrid
          articles={articles}
          loading={isFetchingNextPage}
          onLoadMore={handleLoadMore}
          hasMore={!!hasNextPage}
        />
      )}
    </main>
  );
}
