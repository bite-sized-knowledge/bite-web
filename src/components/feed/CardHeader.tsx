'use client';

import React from 'react';
import Link from 'next/link';
import { Blog } from '@/types/Blog';

interface CardHeaderProps {
  blog: Blog;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ blog }) => {
  return (
    <div className="flex items-center px-3 pt-4 pb-3">
      <Link
        href={`/blog/${blog.id}`}
        className="flex flex-1 items-center gap-2"
      >
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
          {blog.favicon && (
            <img
              src={blog.favicon}
              alt={blog.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
        <span className="text-sm text-[var(--color-gray1)] truncate">
          {blog.title}
        </span>
      </Link>
    </div>
  );
};
