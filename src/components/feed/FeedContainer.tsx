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

  // Infinite scroll: trigger when near-last items are visible
  const setupInfiniteScroll = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            getNextData();
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    // Observe the 3rd-from-last item
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('[data-feed-item]');
    if (items.length >= 3) {
      observerRef.current.observe(items[items.length - 3]);
    } else if (items.length > 0) {
      observerRef.current.observe(items[items.length - 1]);
    }
  }, [getNextData]);

  // Impression tracking
  const setupImpressionTracking = useCallback(() => {
    if (impressionObserverRef.current) {
      impressionObserverRef.current.disconnect();
    }

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
      {
        root: containerRef.current,
        threshold: 0.5,
      },
    );

    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('[data-feed-item]');
    items.forEach((item) => {
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

  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className="h-[calc(100vh-var(--header-height)-var(--tabbar-height))] overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-full items-center justify-center px-5 md:px-0"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            <div className="w-full max-w-[480px]">
              <CardSkeleton />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-var(--header-height)-var(--tabbar-height))] overflow-y-scroll"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {articles.map((article) => (
        <div
          key={article.id}
          data-feed-item
          data-article-id={article.id}
          className="flex h-full items-center justify-center px-5 md:px-0"
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <div className="w-full max-w-[480px]">
            <FeedCard article={article} />
          </div>
        </div>
      ))}

      {isFetchingMore && (
        <div
          className="flex h-full items-center justify-center px-5 md:px-0"
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <div className="w-full max-w-[480px]">
            <CardSkeleton />
          </div>
        </div>
      )}
    </div>
  );
};
