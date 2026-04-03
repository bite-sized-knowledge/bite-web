'use client';

import React, { useRef, useEffect, useState } from 'react';

type TabType = 'latest' | 'recommend';

interface FeedHeaderProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedTab,
  onTabChange,
}) => {
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
        onClick={() => onTabChange('latest')}
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
        onClick={() => onTabChange('recommend')}
      >
        추천
      </button>
      {indicator && (
        <div
          className="absolute bottom-0 h-[2px] bg-[var(--color-text)] transition-all duration-300 ease-in-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
};
