'use client';

import React, { useState, useCallback } from 'react';
import { Article } from '@/types/Article';
import {
  useLikeMutation,
  useBookmarkMutation,
  useShareMutation,
} from '@/hooks/useArticleMutations';

interface CardFooterProps {
  article: Article;
}

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? '#FF6E1C' : 'none'}
    stroke={filled ? '#FF6E1C' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const BookmarkIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? '#FF6E1C' : 'none'}
    stroke={filled ? '#FF6E1C' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const CardFooter: React.FC<CardFooterProps> = ({ article }) => {
  const [liked, setLiked] = useState(article.isLiked);
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [bookmarked, setBookmarked] = useState(article.isArchived);
  const [shareCount, setShareCount] = useState(article.shareCount);
  const [hasShared, setHasShared] = useState(false);

  const likeMutation = useLikeMutation(article.id, (newLiked) => {
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
  });

  const bookmarkMutation = useBookmarkMutation(article.id, (newBookmarked) => {
    setBookmarked(newBookmarked);
  });

  const shareMutation = useShareMutation(article.id);

  const handleLike = useCallback(() => {
    likeMutation.mutate(liked);
  }, [liked, likeMutation]);

  const handleBookmark = useCallback(() => {
    bookmarkMutation.mutate(bookmarked);
  }, [bookmarked, bookmarkMutation]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(article.url);
    } catch {
      // Fallback: do nothing if clipboard API not available
    }
    shareMutation.mutate();
    if (!hasShared) {
      setShareCount((prev) => prev + 1);
      setHasShared(true);
    }
  }, [article.url, shareMutation, hasShared]);

  return (
    <div className="feed-card-footer flex items-center">
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-[var(--color-text)]"
        >
          <HeartIcon filled={liked} />
          {likeCount > 0 && (
            <span className="text-sm">{likeCount}</span>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-[var(--color-text)]"
        >
          <ShareIcon />
          {shareCount > 0 && (
            <span className="text-sm">{shareCount}</span>
          )}
        </button>
      </div>
      <button
        onClick={handleBookmark}
        className="text-[var(--color-text)]"
      >
        <BookmarkIcon filled={bookmarked} />
      </button>
    </div>
  );
};
