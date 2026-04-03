'use client';

import { useMutation } from '@tanstack/react-query';
import * as articleApi from '@/lib/api/article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';

export function useLikeMutation(
  articleId: string,
  onOptimistic: (liked: boolean) => void,
) {
  return useMutation({
    mutationFn: (isCurrentlyLiked: boolean) =>
      isCurrentlyLiked
        ? articleApi.unlike(articleId)
        : articleApi.like(articleId),
    onMutate: (isCurrentlyLiked: boolean) => {
      onOptimistic(!isCurrentlyLiked);
    },
    onSuccess: (_data, isCurrentlyLiked) => {
      sendEvent(
        TARGET_TYPE.ARTICLE,
        articleId,
        isCurrentlyLiked ? EVENT_TYPE.LIKE_CANCEL : EVENT_TYPE.LIKE,
      );
    },
    onError: (_err, isCurrentlyLiked) => {
      // Revert optimistic update
      onOptimistic(isCurrentlyLiked);
    },
  });
}

export function useBookmarkMutation(
  articleId: string,
  onOptimistic: (bookmarked: boolean) => void,
) {
  return useMutation({
    mutationFn: (isCurrentlyBookmarked: boolean) =>
      isCurrentlyBookmarked
        ? articleApi.deleteBookmark(articleId)
        : articleApi.addBookmark(articleId),
    onMutate: (isCurrentlyBookmarked: boolean) => {
      onOptimistic(!isCurrentlyBookmarked);
    },
    onSuccess: (_data, isCurrentlyBookmarked) => {
      sendEvent(
        TARGET_TYPE.ARTICLE,
        articleId,
        isCurrentlyBookmarked ? EVENT_TYPE.ARCHIVE_CANCEL : EVENT_TYPE.ARCHIVE,
      );
    },
    onError: (_err, isCurrentlyBookmarked) => {
      onOptimistic(isCurrentlyBookmarked);
    },
  });
}

export function useShareMutation(articleId: string) {
  return useMutation({
    mutationFn: () => articleApi.share(articleId),
    onSuccess: () => {
      sendEvent(TARGET_TYPE.ARTICLE, articleId, EVENT_TYPE.SHARE);
    },
  });
}
