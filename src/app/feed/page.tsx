'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedContainer } from '@/components/feed/FeedContainer';
import { BlogSelectSheet } from '@/components/feed/BlogSelectSheet';
import { useFeedData, type FeedFilter } from '@/hooks/useFeedData';
import { getBlogs, type BlogResponse } from '@/lib/api/blog';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';

type TabType = 'latest' | 'recommend';

const variants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

export default function FeedPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('latest');
  const [direction, setDirection] = useState(0);
  const [filter, setFilter] = useState<FeedFilter>({ type: 'all' });
  const [blogSheetOpen, setBlogSheetOpen] = useState(false);

  const { data: blogs = [] } = useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogs,
    staleTime: 5 * 60 * 1000,
  });

  const selectedBlog = useMemo(() => {
    if (filter.type !== 'blog') return null;
    return blogs.find((b) => b.id === filter.blogId) ?? null;
  }, [filter, blogs]);

  const handleBlogSelect = (blog: BlogResponse) => {
    setFilter({ type: 'blog', blogId: blog.id });
  };

  const {
    articles,
    isLoading,
    isFetchingMore,
    isError,
    error,
    getNextData,
    removeArticle,
    refresh,
  } = useFeedData(selectedTab, filter);

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
      <OnboardingOverlay />
      <FeedHeader
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        filter={filter}
        onFilterChange={setFilter}
        selectedBlog={selectedBlog}
        onOpenBlogSheet={() => setBlogSheetOpen(true)}
      />
      <BlogSelectSheet
        open={blogSheetOpen}
        blogs={blogs}
        onSelect={handleBlogSelect}
        onClose={() => setBlogSheetOpen(false)}
      />
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
            onRefresh={refresh}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
