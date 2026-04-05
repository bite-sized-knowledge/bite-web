'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useFeedScroll } from '@/hooks/useFeedScroll';
import { SearchIcon } from '@/components/icons/TabIcons';

type TabType = 'latest' | 'recommend';

interface FeedHeaderProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedTab,
  onTabChange,
}) => {
  const { scrollToTop } = useFeedScroll();

  const handleClick = (tab: TabType) => {
    if (tab === selectedTab) {
      scrollToTop(tab);
      return;
    }
    onTabChange(tab);
  };

  const latestRef = useRef<HTMLButtonElement>(null);
  const recommendRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = selectedTab === 'latest' ? latestRef.current : recommendRef.current;
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [selectedTab]);

  return (
    <div className="sticky top-0 z-10 flex h-[var(--header-height)] items-center justify-center gap-5 bg-[var(--color-bg)] relative">
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
      <Link
        href="/search"
        aria-label="검색"
        className="feed-header-search absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
      >
        <SearchIcon size={20} />
      </Link>
    </div>
  );
};
