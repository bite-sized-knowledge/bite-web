'use client';

import React from 'react';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

interface MiniCardProps {
  article: Article;
  isPlaceholder?: boolean;
}

function MiniCardSkeleton() {
  return (
    <div className="min-w-[160px] min-h-[160px] rounded-lg overflow-hidden bg-[var(--color-card-bg)] animate-pulse">
      <div className="w-full h-[80px] bg-[var(--color-gray4)]" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-[var(--color-gray4)] rounded w-full" />
        <div className="h-3 bg-[var(--color-gray4)] rounded w-2/3" />
      </div>
    </div>
  );
}

export default function MiniCard({ article, isPlaceholder }: MiniCardProps) {
  if (isPlaceholder) {
    return <div className="min-w-[160px] min-h-[160px]" />;
  }

  const thumbnail =
    article.thumbnail || article.category?.thumbnail || article.category?.image;

  const handleClick = () => {
    sendEvent(TARGET_TYPE.ARTICLE, article.id, EVENT_TYPE.ARTICLE_CLICK);
    window.open(article.url, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-w-[160px] min-h-[160px] rounded-lg overflow-hidden bg-[var(--color-card-bg)] shadow-sm text-left w-full cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="w-full h-[80px] overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={article.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-gray4)] rounded-t-lg" />
        )}
      </div>

      {/* Title */}
      <div className="p-2">
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
          {article.title}
        </p>
      </div>
    </button>
  );
}

export { MiniCardSkeleton };
