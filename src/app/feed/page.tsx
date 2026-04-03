'use client';

import { useState } from 'react';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedContainer } from '@/components/feed/FeedContainer';
import { useFeedData } from '@/hooks/useFeedData';

type TabType = 'latest' | 'recommend';

export default function FeedPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('latest');
  const { articles, isLoading, isFetchingMore, isError, error, getNextData } =
    useFeedData(selectedTab);

  if (isError) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-[var(--color-error)]">
          {error?.message || '피드를 불러오는 중 오류가 발생했습니다'}
        </p>
      </main>
    );
  }

  return (
    <main className="h-screen bg-[var(--color-bg)]">
      <FeedHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />
      <FeedContainer
        articles={articles}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        getNextData={getNextData}
        selectedTab={selectedTab}
      />
    </main>
  );
}
