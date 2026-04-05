'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedContainer } from '@/components/feed/FeedContainer';
import { useFeedData } from '@/hooks/useFeedData';

type TabType = 'latest' | 'recommend';

const variants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

export default function FeedPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('latest');
  const [direction, setDirection] = useState(0);
  const {
    articles,
    isLoading,
    isFetchingMore,
    isError,
    error,
    getNextData,
    removeArticle,
  } = useFeedData(selectedTab);

  const handleTabChange = (tab: TabType) => {
    if (tab === selectedTab) return;
    setDirection(tab === 'recommend' ? 1 : -1);
    setSelectedTab(tab);
  };

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
    <main className="feed-main">
      <FeedHeader selectedTab={selectedTab} onTabChange={handleTabChange} />
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={selectedTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="feed-body"
        >
          <FeedContainer
            articles={articles}
            isLoading={isLoading}
            isFetchingMore={isFetchingMore}
            getNextData={getNextData}
            selectedTab={selectedTab}
            onUninterest={removeArticle}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
