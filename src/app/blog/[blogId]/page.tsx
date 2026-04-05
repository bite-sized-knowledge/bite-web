'use client';

import React, { useCallback, useEffect, useMemo, useRef, use } from 'react';
import Image from 'next/image';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getBlog, getBlogArticle } from '@/lib/api/blog';
import ArticleGrid from '@/components/grid/ArticleGrid';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

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

  // BLOG_IN on mount (once per blogId)
  useEffect(() => {
    if (!blogId) return;
    sendEvent(TARGET_TYPE.BLOG, blogId, EVENT_TYPE.BLOG_IN);
  }, [blogId]);

  // B_IMP impression tracking on article grid items
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (articles.length === 0) return;
    const container = gridRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.gridArticleId;
            if (id) {
              sendEvent(TARGET_TYPE.ARTICLE, id, EVENT_TYPE.B_IMP);
            }
          }
        }
      },
      { threshold: 0.5 },
    );

    container
      .querySelectorAll('[data-grid-article-id]')
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [articles.length]);

  const handleArticleBeforeOpen = useCallback(
    (articleId: string) => {
      sendEvent(TARGET_TYPE.ARTICLE, articleId, EVENT_TYPE.BLOG_TO_ARTICLE);
    },
    [],
  );

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        {blogData?.favicon ? (
          <Image
            src={blogData.favicon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--color-gray4)] animate-pulse" />
        )}
        {blogData?.title ? (
          <h1 className="text-xl font-bold text-[var(--color-text)] truncate">
            {blogData.title}
          </h1>
        ) : (
          <div className="h-5 w-32 rounded bg-[var(--color-gray4)] animate-pulse" />
        )}
      </header>

      <ArticleGrid
        articles={articles}
        loading={isLoading || isFetchingNextPage}
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        onArticleBeforeOpen={handleArticleBeforeOpen}
        gridRef={gridRef}
      />
    </main>
  );
}
