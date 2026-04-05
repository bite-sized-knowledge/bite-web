'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { useHistory } from '@/hooks/useHistory';
import ArticleGrid from '@/components/grid/ArticleGrid';
import MemberModal from '@/components/auth/MemberModal';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';
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
    refetch,
  } = useHistory();

  // Refetch when the tab regains focus so we pick up newly-viewed articles.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refetch]);

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
        <button
          type="button"
          onClick={() => router.push('/my')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          aria-label="뒤로 가기"
        >
          <ArrowLeftIcon size={20} />
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
