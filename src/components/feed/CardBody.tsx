'use client';

import React from 'react';
import Image from 'next/image';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

interface CardBodyProps {
  article: Article;
}

export const CardBody: React.FC<CardBodyProps> = ({ article }) => {
  const thumbnail =
    article.thumbnail || article.category?.thumbnail || '/default-thumbnail.png';

  const handleClick = () => {
    try {
      const parsed = new URL(article.url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
    } catch {
      return;
    }
    sendEvent(TARGET_TYPE.ARTICLE, article.id, EVENT_TYPE.ARTICLE_CLICK);
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="block w-full text-left"
    >
      <Image
        src={thumbnail}
        alt={article.title}
        width={640}
        height={280}
        className="h-[160px] w-full object-cover lg:h-[280px]"
        unoptimized
      />

      <div className="min-h-[128px] px-3 pt-4 pb-3 lg:px-5 lg:pt-5 lg:pb-4 lg:min-h-[160px]">
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-[var(--color-text)] lg:text-2xl">
          {article.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-base text-[var(--color-gray1)] lg:text-lg">
          {article.description}
        </p>
        {article.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {article.keywords.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-[var(--color-gray4)] px-2.5 py-1 text-xs text-[var(--color-sub)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
