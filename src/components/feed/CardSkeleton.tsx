'use client';

import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="min-w-[320px] w-full overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-md animate-pulse">
      <div className="feed-card-header flex items-center gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-[var(--color-gray4)]" />
        <div className="h-3.5 w-28 rounded-md bg-[var(--color-gray4)]" />
      </div>

      <div className="feed-thumbnail w-full bg-[var(--color-gray4)] relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>

      <div className="feed-card-content">
        <div className="mb-2 h-5 w-[85%] rounded-md bg-[var(--color-gray4)]" />
        <div className="mb-3 h-5 w-[55%] rounded-md bg-[var(--color-gray4)]" />
        <div className="mb-1.5 h-3.5 w-[95%] rounded-md bg-[var(--color-gray4)]" />
        <div className="mb-3 h-3.5 w-[70%] rounded-md bg-[var(--color-gray4)]" />
        <div className="flex gap-1.5">
          <div className="h-6 w-16 rounded-full bg-[var(--color-gray4)]" />
          <div className="h-6 w-20 rounded-full bg-[var(--color-gray4)]" />
          <div className="h-6 w-14 rounded-full bg-[var(--color-gray4)]" />
        </div>
      </div>

      <div className="feed-card-footer flex items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="h-6 w-6 rounded bg-[var(--color-gray4)]" />
          <div className="h-6 w-6 rounded bg-[var(--color-gray4)]" />
        </div>
        <div className="h-6 w-6 rounded bg-[var(--color-gray4)]" />
      </div>
    </div>
  );
};
