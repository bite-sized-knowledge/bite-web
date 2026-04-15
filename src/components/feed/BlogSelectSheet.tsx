'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import type { BlogResponse } from '@/lib/api/blog';
import { shortenBlogName } from '@/types/Blog';

const DRAG_CLOSE_THRESHOLD = 80;

interface BlogSelectSheetProps {
  open: boolean;
  blogs: BlogResponse[];
  onSelect: (blog: BlogResponse) => void;
  onClose: () => void;
}

function SheetContent({
  blogs,
  onSelect,
  onClose,
}: {
  blogs: BlogResponse[];
  onSelect: (blog: BlogResponse) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Lock body scroll + capture initial height before keyboard appears
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setFixedHeight(Math.round(window.innerHeight * 0.7));
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const subscribedBlogs = useMemo(
    () => blogs.filter((b) => b.isSubscribed),
    [blogs],
  );
  const otherBlogs = useMemo(
    () => blogs.filter((b) => !b.isSubscribed),
    [blogs],
  );

  const filterBySearch = (list: BlogResponse[]) => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((b) => b.title.toLowerCase().includes(q));
  };

  const filteredSubscribed = filterBySearch(subscribedBlogs);
  const filteredOther = filterBySearch(otherBlogs);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) {
      onClose();
    }
  };

  const handleSelect = (blog: BlogResponse) => {
    onSelect(blog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-[640px] rounded-t-2xl bg-[var(--color-card-bg)] shadow-2xl flex flex-col"
        style={{ height: fixedHeight ?? '70vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 rounded-t-2xl">
          <div className="h-1 w-10 rounded-full bg-[var(--color-gray3)]" />
        </div>

        {/* Title */}
        <div className="px-4 pb-3">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            블로그 선택
          </h2>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="블로그 검색"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-gray3)] outline-none focus:border-[var(--color-main)] transition-colors"
          />
        </div>

        {/* Blog list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredSubscribed.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-[var(--color-gray3)]">
                구독 중
              </p>
              <div className="grid grid-cols-3 gap-2">
                {filteredSubscribed.map((blog) => (
                  <button
                    key={blog.id}
                    className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-2.5 transition-colors hover:bg-[var(--color-surface-hover)]"
                    onClick={() => handleSelect(blog)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.favicon}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded-md"
                    />
                    <span className="text-[0.8125rem] font-medium text-[var(--color-text)] overflow-hidden text-ellipsis whitespace-nowrap">
                      {shortenBlogName(blog.title)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredOther.length > 0 && (
            <div>
              {filteredSubscribed.length > 0 && (
                <p className="mb-2 text-xs font-medium text-[var(--color-gray3)]">
                  전체
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {filteredOther.map((blog) => (
                  <button
                    key={blog.id}
                    className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-2.5 transition-colors hover:bg-[var(--color-surface-hover)]"
                    onClick={() => handleSelect(blog)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.favicon}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded-md"
                    />
                    <span className="text-[0.8125rem] font-medium text-[var(--color-text)] overflow-hidden text-ellipsis whitespace-nowrap">
                      {shortenBlogName(blog.title)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSubscribed.length === 0 && filteredOther.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-gray3)]">
              검색 결과가 없습니다
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function BlogSelectSheet({
  open,
  blogs,
  onSelect,
  onClose,
}: BlogSelectSheetProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <SheetContent
          key="blog-select"
          blogs={blogs}
          onSelect={onSelect}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
