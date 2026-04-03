'use client';

import React from 'react';

type TabType = 'latest' | 'recommend';

interface FeedHeaderProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedTab,
  onTabChange,
}) => {
  return (
    <div className="sticky top-0 z-10 flex h-[var(--header-height)] items-center justify-center gap-5 bg-[var(--color-bg)]">
      <button
        className={`px-2 py-2.5 text-lg font-semibold transition-colors ${
          selectedTab === 'latest'
            ? 'border-b-2 border-[var(--color-text)] text-[var(--color-text)]'
            : 'text-[var(--color-gray3)]'
        }`}
        onClick={() => onTabChange('latest')}
      >
        최신
      </button>
      <button
        className={`px-2 py-2.5 text-lg font-semibold transition-colors ${
          selectedTab === 'recommend'
            ? 'border-b-2 border-[var(--color-text)] text-[var(--color-text)]'
            : 'text-[var(--color-gray3)]'
        }`}
        onClick={() => onTabChange('recommend')}
      >
        추천
      </button>
    </div>
  );
};
