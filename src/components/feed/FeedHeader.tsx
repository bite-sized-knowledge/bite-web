'use client';

import React, { useRef, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useFeedScroll } from '@/hooks/useFeedScroll';
import { useTheme } from '@/lib/theme/provider';
import { SearchIcon } from '@/components/icons/TabIcons';
import { Icon } from '@/components/ui/Icon';
import type { FeedFilter } from '@/hooks/useFeedData';
import type { BlogResponse } from '@/lib/api/blog';
import { shortenBlogName } from '@/types/Blog';

type TabType = 'latest' | 'recommend';

interface FeedHeaderProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  filter?: FeedFilter;
  onFilterChange?: (filter: FeedFilter) => void;
  selectedBlog?: BlogResponse | null;
  onOpenBlogSheet?: () => void;
}

const chipBase =
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors';
const chipInactive = `${chipBase} bg-[var(--color-gray4)] text-[var(--color-gray2)]`;
const chipActive = `${chipBase} bg-[var(--color-text)] text-[var(--color-bg)]`;

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedTab,
  onTabChange,
  filter,
  onFilterChange,
  selectedBlog,
  onOpenBlogSheet,
}) => {
  const { scrollToTop } = useFeedScroll();
  const { themeMode, toggleTheme } = useTheme();

  const handleClick = (tab: TabType) => {
    if (tab === selectedTab) {
      scrollToTop(tab);
      return;
    }
    onTabChange(tab);
  };

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const latestRef = useRef<HTMLButtonElement>(null);
  const recommendRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = selectedTab === 'latest' ? latestRef.current : recommendRef.current;
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [selectedTab]);

  const showFilter = selectedTab === 'latest' && filter && onFilterChange && onOpenBlogSheet;

  const isAll = filter?.type === 'all';
  const isKo = filter?.type === 'lang' && filter.value === 'ko';
  const isEn = filter?.type === 'lang' && filter.value === 'en';
  const isBlog = filter?.type === 'blog';

  return (
    <div className="sticky top-0 z-10 bg-[var(--color-bg)]">
      {/* Row 1: tabs + icons (48px, unchanged) */}
      <div className="flex h-[var(--header-height)] items-center justify-center gap-5 relative">
        <button
          ref={latestRef}
          className={`px-2 py-2 text-base font-semibold transition-colors ${
            selectedTab === 'latest'
              ? 'text-[var(--color-text)]'
              : 'text-[var(--color-gray3)]'
          }`}
          onClick={() => handleClick('latest')}
        >
          최신
        </button>
        <button
          ref={recommendRef}
          className={`px-2 py-2 text-base font-semibold transition-colors ${
            selectedTab === 'recommend'
              ? 'text-[var(--color-text)]'
              : 'text-[var(--color-gray3)]'
          }`}
          onClick={() => handleClick('recommend')}
        >
          추천
        </button>
        {indicator && (
          <div
            className="absolute bottom-0 h-[2px] bg-[var(--color-text)] transition-all duration-300 ease-in-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted && themeMode === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            suppressHydrationWarning
          >
            <Icon name={mounted ? (themeMode === 'light' ? 'moon' : 'sun') : 'moon'} size={20} />
          </button>
          <Link
            href="/search"
            aria-label="검색"
            className="feed-header-search flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            <SearchIcon size={20} />
          </Link>
        </div>
      </div>

      {/* Row 2: compact filter chips (28px, only when latest tab active) */}
      {showFilter && (
        <div className="flex items-center justify-center gap-2 pb-2">
          <button className={isAll ? chipActive : chipInactive} onClick={() => onFilterChange({ type: 'all' })}>
            전체
          </button>
          <button className={isKo ? chipActive : chipInactive} onClick={() => onFilterChange({ type: 'lang', value: 'ko' })}>
            국내
          </button>
          <button className={isEn ? chipActive : chipInactive} onClick={() => onFilterChange({ type: 'lang', value: 'en' })}>
            해외
          </button>
          {isBlog && selectedBlog ? (
            <button className={`${chipActive} gap-1`} onClick={() => onFilterChange({ type: 'all' })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedBlog.favicon} alt="" width={12} height={12} className="w-3 h-3 rounded-sm shrink-0" />
              <span>{shortenBlogName(selectedBlog.title)}</span>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <button className={chipInactive} onClick={onOpenBlogSheet}>
              블로그
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden className="shrink-0 ml-0.5">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
