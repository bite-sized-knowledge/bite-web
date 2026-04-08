'use client';

import React, { useState } from 'react';
import { Article } from '@/types/Article';
import { useArticleReaderEvents } from '@/hooks/useArticleReaderEvents';

import { DEFAULT_THUMBNAIL } from '@/lib/constants';

interface CardBodyProps {
  article: Article;
}

export const CardBody: React.FC<CardBodyProps> = ({ article }) => {
  const thumbnail =
    article.thumbnail || DEFAULT_THUMBNAIL;
  const [imgSrc, setImgSrc] = useState(thumbnail);
  const { openArticle } = useArticleReaderEvents();

  const handleClick = () => {
    openArticle(article.id, article.url);
  };

  return (
    <button onClick={handleClick} className="block w-full text-left">
      <img
        src={imgSrc}
        alt={article.title}
        className="feed-thumbnail w-full object-cover"
        loading="lazy"
        onError={() => {
          if (imgSrc !== DEFAULT_THUMBNAIL) setImgSrc(DEFAULT_THUMBNAIL);
        }}
      />

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
