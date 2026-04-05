'use client';

import React, { useState, useCallback } from 'react';
import { Article } from '@/types/Article';
import {
  useLikeMutation,
  useBookmarkMutation,
  useShareMutation,
} from '@/hooks/useArticleMutations';
import { useToast } from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icon';

interface CardFooterProps {
  article: Article;
}

export const CardFooter: React.FC<CardFooterProps> = ({ article }) => {
  const [liked, setLiked] = useState(article.isLiked);
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [bookmarked, setBookmarked] = useState(article.isArchived);
  const [shareCount, setShareCount] = useState(article.shareCount);
  const [hasShared, setHasShared] = useState(false);
  const toast = useToast();

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
    let copied = false;
    try {
      await navigator.clipboard.writeText(article.url);
      copied = true;
    } catch {
      // Clipboard API unavailable — still record the share on the server
    }
    shareMutation.mutate();
    if (!hasShared) {
      setShareCount((prev) => prev + 1);
      setHasShared(true);
    }
    if (copied) {
      toast.show('클립보드에 주소가 복사되었습니다');
    }
  }, [article.url, shareMutation, hasShared, toast]);

  return (
    <div className="feed-card-footer flex items-center">
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-[var(--color-text)]"
          aria-label={liked ? '좋아요 취소' : '좋아요'}
        >
          <Icon name={liked ? 'heart_fill' : 'heart_default'} size={24} />
          {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-[var(--color-text)]"
          aria-label="공유"
        >
          <Icon name="share" size={24} />
          {shareCount > 0 && <span className="text-sm">{shareCount}</span>}
        </button>
      </div>
      <button
        onClick={handleBookmark}
        className="text-[var(--color-text)]"
        aria-label={bookmarked ? '쿠키에서 제거' : '쿠키에 저장'}
      >
        <Icon name={bookmarked ? 'cookie_fill' : 'cookie_default'} size={24} />
      </button>
    </div>
  );
};
