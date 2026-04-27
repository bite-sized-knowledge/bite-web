'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Article } from '@/types/Article';
import { SearchResultCard, type SearchRankingContext } from './SearchResultCard';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface SearchResultListProps {
  articles: Article[];
  query: string;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onSelectArticle: (article: Article, position: number) => void;
  ranking?: SearchRankingContext;
}

export function SearchResultList({
  articles,
  query,
  hasMore,
  loading,
  onLoadMore,
  onSelectArticle,
  ranking,
}: SearchResultListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
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
    <div className="px-4 pb-8 max-w-2xl mx-auto">
      <p className="text-xs text-[var(--color-gray3)] mb-3">
        {articles.length}개의 검색 결과
        {hasMore && '+'}
      </p>

      <motion.div
        className="flex flex-col gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {articles.map((article, index) => (
          <motion.div key={article.id} variants={item}>
            <SearchResultCard article={article} query={query} position={index} onSelect={onSelectArticle} ranking={ranking} />
          </motion.div>
        ))}
      </motion.div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 rounded-full border-2 border-[var(--color-gray4)] border-t-[var(--color-main)] animate-spin" />
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}
