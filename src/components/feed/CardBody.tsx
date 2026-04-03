'use client';

import React from 'react';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

interface CardBodyProps {
  article: Article;
}

export const CardBody: React.FC<CardBodyProps> = ({ article }) => {
  const thumbnail =
    article.thumbnail || article.category?.thumbnail || null;

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
    <button onClick={handleClick} className="block w-full text-left">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={article.title}
          className="feed-thumbnail w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="feed-thumbnail flex w-full items-center justify-center bg-[var(--color-gray4)]">
          <span className="text-4xl text-[var(--color-gray3)]">B</span>
        </div>
      )}

      <div className="feed-card-content">
        <h3 className="feed-card-title line-clamp-2 font-semibold text-[var(--color-text)]">
          {article.title}
        </h3>
        <p className="feed-card-desc line-clamp-2 text-[var(--color-gray1)]">
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
