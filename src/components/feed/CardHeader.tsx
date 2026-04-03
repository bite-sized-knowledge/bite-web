'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Blog } from '@/types/Blog';

interface CardHeaderProps {
  blog: Blog;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ blog }) => {
  return (
    <div className="feed-card-header flex items-center">
      <Link
        href={`/blog/${blog.id}`}
        className="flex flex-1 items-center gap-2"
      >
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
          {blog.favicon && (
            <Image
              src={blog.favicon}
              alt={blog.title}
              width={24}
              height={24}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              unoptimized
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
