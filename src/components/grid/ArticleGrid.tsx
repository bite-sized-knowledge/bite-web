'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Article } from '@/types/Article';
import MiniCard, { MiniCardSkeleton } from './MiniCard';

interface ArticleGridProps {
  articles: Article[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ArticleGrid({
  articles,
  loading = false,
  onLoadMore,
  hasMore = false,
}: ArticleGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
        {articles.map((article, index) => (
          <MiniCard key={article.id ?? index} article={article} />
        ))}
        {loading &&
          Array.from({ length: articles.length === 0 ? 8 : 4 }).map((_, i) => (
            <MiniCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}
