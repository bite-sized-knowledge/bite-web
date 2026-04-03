'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Article } from '@/types/Article';
import { FeedCard } from './FeedCard';
import { CardSkeleton } from './CardSkeleton';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

interface FeedContainerProps {
  articles: Article[];
  isLoading: boolean;
  isFetchingMore: boolean;
  getNextData: () => void;
  selectedTab: 'latest' | 'recommend';
}

export const FeedContainer: React.FC<FeedContainerProps> = ({
  articles,
  isLoading,
  isFetchingMore,
  getNextData,
  selectedTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const impressionObserverRef = useRef<IntersectionObserver | null>(null);

  const setupInfiniteScroll = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) getNextData();
        }
      },
      { root: containerRef.current, threshold: 0.1 },
    );
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll('[data-feed-item]');
    if (items.length >= 3) observerRef.current.observe(items[items.length - 3]);
    else if (items.length > 0) observerRef.current.observe(items[items.length - 1]);
  }, [getNextData]);

  const setupImpressionTracking = useCallback(() => {
    if (impressionObserverRef.current) impressionObserverRef.current.disconnect();
    impressionObserverRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const articleId = (entry.target as HTMLElement).dataset.articleId;
            if (articleId) {
              sendEvent(
                TARGET_TYPE.ARTICLE,
                articleId,
                selectedTab === 'latest' ? EVENT_TYPE.R_IMP : EVENT_TYPE.F_IMP,
              );
            }
          }
        }
      },
      { root: containerRef.current, threshold: 0.5 },
    );
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll('[data-feed-item]').forEach((item) => {
      impressionObserverRef.current?.observe(item);
    });
  }, [selectedTab]);

  useEffect(() => {
    setupInfiniteScroll();
    setupImpressionTracking();
    return () => {
      observerRef.current?.disconnect();
      impressionObserverRef.current?.disconnect();
    };
  }, [articles.length, setupInfiniteScroll, setupImpressionTracking]);

  const renderItem = (content: React.ReactNode, key: string | number, articleId?: string) => (
    <div
      key={key}
      className="feed-snap-item"
      {...(articleId ? { 'data-feed-item': true, 'data-article-id': articleId } : {})}
    >
      <div className="feed-card-sizer">
        {content}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="feed-scroll-area">
      {isLoading
        ? [1, 2, 3].map((i) => renderItem(<CardSkeleton />, i))
        : articles.map((article) =>
            renderItem(<FeedCard article={article} />, article.id, article.id)
          )}
      {isFetchingMore && renderItem(<CardSkeleton />, 'loading-more')}
    </div>
  );
};
