'use client';

import React, { useMemo, use } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getBlog, getBlogArticle } from '@/lib/api/blog';
import ArticleGrid from '@/components/grid/ArticleGrid';
import { Article } from '@/types/Article';

const ROWS_PER_PAGE = 10;

export default function BlogPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = use(params);

  const { data: blogData } = useQuery({
    queryKey: ['blog', blogId] as const,
    queryFn: async () => {
      const { data } = await getBlog(blogId);
      return data;
    },
    enabled: !!blogId,
  });

  const {
    data: articlesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['blogArticles', blogId] as const,
    queryFn: async ({ pageParam }) => {
      const result = await getBlogArticle(blogId, ROWS_PER_PAGE, pageParam);
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.next ?? null,
    enabled: !!blogId,
  });

  const articles: Article[] = useMemo(
    () =>
      articlesData?.pages.flatMap(
        (page) => (page?.articles ?? []) as Article[],
      ) ?? [],
    [articlesData],
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        {blogData?.favicon ? (
          <img
            src={blogData.favicon}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--color-gray4)]" />
        )}
        <h1 className="text-xl font-bold text-[var(--color-text)] truncate">
          {blogData?.title ?? ''}
        </h1>
      </header>

      <ArticleGrid
        articles={articles}
        loading={isLoading || isFetchingNextPage}
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
      />
    </main>
  );
}
