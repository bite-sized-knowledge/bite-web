'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';
import { HighlightMatch } from './HighlightMatch';
import { Icon } from '@/components/ui/Icon';

import { DEFAULT_THUMBNAIL } from '@/lib/constants';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월 전`;
  return `${Math.floor(months / 12)}년 전`;
}

interface SearchResultCardProps {
  article: Article;
  query: string;
  position: number;
  onSelect: (article: Article, position: number) => void;
}

export function SearchResultCard({ article, query, position, onSelect }: SearchResultCardProps) {
  // S_IMP: fire once when card enters viewport
  const cardRef = useRef<HTMLDivElement>(null);
  const impressedRef = useRef(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || impressedRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressedRef.current) {
          impressedRef.current = true;
          sendEvent(TARGET_TYPE.ARTICLE, article.id, EVENT_TYPE.S_IMP, {
            source: 'search',
            position,
            metadata: { query },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [article.id, position, query]);

  const thumbnail =
    article.thumbnail || DEFAULT_THUMBNAIL;
  const [imgSrc, setImgSrc] = useState(thumbnail);

  const handleClick = () => {
    onSelect(article, position);
  };

  return (
    <div
      ref={cardRef}
      className="flex gap-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-divider)] p-3 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] overflow-hidden rounded-lg">
        <Image
          src={imgSrc}
          alt={article.title}
          width={96}
          height={96}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => {
            if (imgSrc !== DEFAULT_THUMBNAIL) setImgSrc(DEFAULT_THUMBNAIL);
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Blog info + date */}
        <div className="flex items-center gap-1.5">
          {article.blog?.favicon && (
            <div className="h-4 w-4 shrink-0 overflow-hidden rounded-full bg-[var(--color-gray4)]">
              <Image
                src={article.blog.favicon}
                alt=""
                width={16}
                height={16}
                className="h-full w-full object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <Link
            href={`/blog/${article.blog?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[var(--color-gray2)] truncate hover:underline"
          >
            {article.blog?.title}
          </Link>
          {article.publishedAt && (
            <>
              <span className="text-[var(--color-gray3)] text-[10px]">·</span>
              <span className="text-xs text-[var(--color-gray3)] shrink-0">
                {timeAgo(article.publishedAt)}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 leading-snug">
          <HighlightMatch text={article.title} query={query} />
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs text-[var(--color-gray2)] line-clamp-2 leading-relaxed">
            <HighlightMatch text={article.description} query={query} />
          </p>
        )}

        {/* Keywords + like count */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          {article.keywords.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs text-[var(--color-sub)]"
            >
              #{tag}
            </span>
          ))}
          {article.likeCount > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-xs text-[var(--color-gray3)]">
              <Icon name="heart_default" size={12} />
              {article.likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
