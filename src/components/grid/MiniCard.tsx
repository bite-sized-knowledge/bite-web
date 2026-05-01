'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Article } from '@/types/Article';
import { useArticleReaderEvents } from '@/hooks/useArticleReaderEvents';

import { DEFAULT_THUMBNAIL } from '@/lib/constants';
import { toHttpsUrl } from '@/lib/image';

interface MiniCardProps {
  article: Article;
  isPlaceholder?: boolean;
  onBeforeOpen?: (articleId: string) => void;
  onArticleClick?: (article: Article) => void;
}

function MiniCardSkeleton() {
  return (
    <div className="min-w-[160px] rounded-lg overflow-hidden bg-[var(--color-card-bg)] animate-pulse">
      <div className="w-full aspect-[2/1] bg-[var(--color-gray4)]" />
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[var(--color-gray4)] shrink-0" />
          <div className="h-2.5 bg-[var(--color-gray4)] rounded w-16" />
        </div>
        <div className="h-3 bg-[var(--color-gray4)] rounded w-full" />
        <div className="h-3 bg-[var(--color-gray4)] rounded w-2/3" />
      </div>
    </div>
  );
}

export default function MiniCard({
  article,
  isPlaceholder,
  onBeforeOpen,
  onArticleClick,
}: MiniCardProps) {
  const { openArticle } = useArticleReaderEvents();
  const thumbnail = toHttpsUrl(article.thumbnail) || DEFAULT_THUMBNAIL;
  const [imgSrc, setImgSrc] = useState(thumbnail);
  const [faviconSrc, setFaviconSrc] = useState(toHttpsUrl(article.blog?.favicon) || DEFAULT_THUMBNAIL);

  if (isPlaceholder) {
    return <div className="min-w-[160px] min-h-[160px]" />;
  }

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      onBeforeOpen?.(article.id);
      openArticle(article.id, article.url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-w-[160px] rounded-lg overflow-hidden bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-border)] text-left w-full cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="w-full aspect-[2/1] overflow-hidden">
        <Image
          src={imgSrc}
          alt={article.title}
          width={160}
          height={80}
          className="w-full h-full object-cover rounded-t-lg"
          unoptimized
          onError={() => {
            if (imgSrc !== DEFAULT_THUMBNAIL) setImgSrc(DEFAULT_THUMBNAIL);
          }}
        />
      </div>

      {/* Info */}
      <div className="p-2">
        {article.blog?.title && (
          <div className="flex items-center gap-1.5 mb-1">
            <Image
              src={faviconSrc}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 rounded-full object-cover shrink-0"
              unoptimized
              onError={() => {
                if (faviconSrc !== DEFAULT_THUMBNAIL) setFaviconSrc(DEFAULT_THUMBNAIL);
              }}
            />
            <span className="text-xs text-[var(--color-gray3)] truncate">
              {article.blog.title}
            </span>
          </div>
        )}
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
          {article.title}
        </p>
      </div>
    </button>
  );
}

export { MiniCardSkeleton };
