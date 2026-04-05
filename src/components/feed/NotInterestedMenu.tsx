'use client';

import { useEffect, useRef, useState } from 'react';
import { useUninterestMutation } from '@/hooks/useArticleMutations';
import { useToast } from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icon';

interface NotInterestedMenuProps {
  articleId: string;
  onUninterest: (articleId: string) => void;
}

export function NotInterestedMenu({
  articleId,
  onUninterest,
}: NotInterestedMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const uninterestMutation = useUninterestMutation(articleId, () => {
    toast.show('앞으로 비슷한 게시물이 더 적게 추천돼요');
    onUninterest(articleId);
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen((v) => !v);
  };

  const handleUninterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
    uninterestMutation.mutate();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="더보기"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
      >
        <Icon name="dots" size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] py-1 shadow-lg">
          <button
            type="button"
            onClick={handleUninterest}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            <Icon name="bad" size={18} />
            <span>관심 없음</span>
          </button>
        </div>
      )}
    </div>
  );
}
