'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import type { BlogResponse } from '@/lib/api/blog';
import { shortenBlogName } from '@/types/Blog';
import { toHttpsUrl } from '@/lib/image';

const DRAG_CLOSE_THRESHOLD = 80;

const BlogButton = memo(function BlogButton({
  blog,
  isSelected,
  onToggle,
}: {
  blog: BlogResponse;
  isSelected: boolean;
  onToggle: (blogId: string) => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 rounded-xl p-2.5 transition-colors ${
        isSelected
          ? 'bg-[var(--color-main)]/10 ring-1 ring-[var(--color-main)]'
          : 'bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)]'
      }`}
      onClick={() => onToggle(blog.id)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toHttpsUrl(blog.favicon)}
        alt=""
        width={24}
        height={24}
        className="rounded-md shrink-0"
      />
      <span className="text-[0.8125rem] font-medium text-[var(--color-text)] overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">
        {shortenBlogName(blog.title)}
      </span>
      {isSelected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--color-main)]">
          <path d="M4 8.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
});

interface BlogSelectSheetProps {
  open: boolean;
  blogs: BlogResponse[];
  selectedBlogIds: string[];
  onApply: (blogIds: string[]) => void;
  onClose: () => void;
}

function SheetContent({
  blogs,
  initialSelectedIds,
  onApply,
  onClose,
}: {
  blogs: BlogResponse[];
  initialSelectedIds: string[];
  onApply: (blogIds: string[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );
  const [fixedHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.7) : null,
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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

  const toggleBlog = useCallback((blogId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(blogId)) {
        next.delete(blogId);
      } else {
        next.add(blogId);
      }
      return next;
    });
  }, []);

  const handleApply = () => {
    onApply(Array.from(selected));
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
        <div className="px-4 pb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            블로그 선택
          </h2>
          {selected.size > 0 && (
            <button
              className="text-xs text-[var(--color-gray3)] hover:text-[var(--color-text)] transition-colors"
              onClick={() => setSelected(new Set())}
            >
              초기화
            </button>
          )}
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
              <div className="grid grid-cols-2 gap-2">
                {filteredSubscribed.map((blog) => (
                  <BlogButton key={blog.id} blog={blog} isSelected={selected.has(blog.id)} onToggle={toggleBlog} />
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
              <div className="grid grid-cols-2 gap-2">
                {filteredOther.map((blog) => (
                  <BlogButton key={blog.id} blog={blog} isSelected={selected.has(blog.id)} onToggle={toggleBlog} />
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

        {/* Apply button */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">
          <button
            className="w-full rounded-xl py-3 text-sm font-semibold transition-colors bg-[var(--color-main)] text-white disabled:opacity-40"
            disabled={selected.size === 0}
            onClick={handleApply}
          >
            {selected.size > 0
              ? `${selected.size}개 블로그 적용`
              : '블로그를 선택하세요'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function BlogSelectSheet({
  open,
  blogs,
  selectedBlogIds,
  onApply,
  onClose,
}: BlogSelectSheetProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <SheetContent
          key="blog-select"
          blogs={blogs}
          initialSelectedIds={selectedBlogIds}
          onApply={onApply}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
