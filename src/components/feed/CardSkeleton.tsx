'use client';

import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="min-w-[320px] w-full overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-md animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center px-3 pt-4 pb-3">
        <div className="h-6 w-6 rounded-full bg-[var(--color-gray4)]" />
        <div className="ml-2 h-4 w-24 rounded bg-[var(--color-gray4)]" />
      </div>

      {/* Thumbnail skeleton */}
      <div className="h-[160px] w-full bg-[var(--color-gray4)]" />

      {/* Content skeleton */}
      <div className="min-h-[128px] px-3 pt-4 pb-3">
        <div className="mb-2 h-5 w-[70%] rounded bg-[var(--color-gray4)]" />
        <div className="mb-4 h-4 w-[90%] rounded bg-[var(--color-gray4)]" />
        <div className="flex gap-1">
          <div className="h-6 w-16 rounded-full bg-[var(--color-gray4)]" />
          <div className="h-6 w-16 rounded-full bg-[var(--color-gray4)]" />
          <div className="h-6 w-16 rounded-full bg-[var(--color-gray4)]" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center px-3 py-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="h-6 w-6 rounded-full bg-[var(--color-gray4)]" />
          <div className="h-6 w-6 rounded-full bg-[var(--color-gray4)]" />
        </div>
        <div className="h-6 w-6 rounded-full bg-[var(--color-gray4)]" />
      </div>
    </div>
  );
};
