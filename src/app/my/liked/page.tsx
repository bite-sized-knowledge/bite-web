'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import ArticleGrid from '@/components/grid/ArticleGrid';
import MemberModal from '@/components/auth/MemberModal';
import BackButton from '@/components/layout/BackButton';
import { Article } from '@/types/Article';

export default function LikedPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const showModal = !isLoggedIn;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLikedArticles(isLoggedIn);

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
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <BackButton href="/my" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          좋아요 한 글
        </h1>
      </header>

      {isLoading ? (
        <ArticleGrid articles={[]} loading={true} />
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-base text-[var(--color-gray3)]">
            좋아요 한 글이 없습니다
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
